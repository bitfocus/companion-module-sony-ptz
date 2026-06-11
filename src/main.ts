import {
	InstanceBase,
	runEntrypoint,
	InstanceStatus,
	SomeCompanionConfigField,
	type CompanionVariableValues,
} from '@companion-module/base'
import { GetConfigFields, type ModuleConfig, type ModuleSecrets } from './config.js'
import { UpdateVariableDefinitions, deriveVariableValues } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions/index.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import { SonyPTZ, PtzCommandParams, PtzError } from './api/transport.js'
import { CameraApi } from './api/camera-api.js'
import {
	CameraState,
	stateFromAutoFraming,
	stateFromPtzf,
	stateFromSceneFile,
	stateFromStream,
	stateFromSystemInfo,
} from './state/camera-state.js'

export class ModuleInstance extends InstanceBase<ModuleConfig, ModuleSecrets> {
	config!: ModuleConfig // Setup in init()
	secrets!: ModuleSecrets // Setup in init()
	api?: CameraApi
	timeoutID?: ReturnType<typeof setTimeout>
	_status: InstanceStatus = InstanceStatus.Disconnected
	// Single source of truth for the camera's current state; feedbacks read it and variables derive from it.
	state: CameraState = new CameraState()
	lastStepTime: number = 0
	// Guards against overlapping checkStatus runs (background reconnect + polling tick).
	private isChecking: boolean = false

	constructor(internal: unknown) {
		super(internal)
	}

	private set status(status: InstanceStatus) {
		this._status = status
		this.updateStatus(status)
	}

	private get status(): InstanceStatus {
		return this._status
	}

	/** Refresh feedbacks right after a command instead of waiting for the next poll. */
	private async refreshFeedbacksAfterCommand(params: PtzCommandParams): Promise<void> {
		if (!this.api) return
		const inqs = new Set<string>()
		for (const key of Object.keys(params)) {
			if (key.startsWith('PtzAutoFraming')) inqs.add('autoFraming')
			else if (key === 'FocusMode' || key === 'AFMode' || key === 'AFSensitivity') inqs.add('ptzf')
			else if (key.startsWith('SceneFile')) inqs.add('sceneFile')
			else if (key === 'System') inqs.add('power')
		}
		let changed = false
		for (const inq of inqs) {
			try {
				if (inq === 'autoFraming') {
					changed = this.state.update(stateFromAutoFraming(await this.api.query.autoFraming())) || changed
				} else if (inq === 'ptzf') {
					changed = this.state.update(stateFromPtzf(await this.api.query.ptzf())) || changed
				} else if (inq === 'sceneFile') {
					changed = this.state.update(stateFromSceneFile(await this.api.query.sceneFile())) || changed
				} else if (inq === 'power') {
					changed = this.state.set('power', (await this.api.query.sysInfo()).power) || changed
				}
			} catch {
				// Best-effort: the next regular poll will reconcile if this targeted refresh fails.
			}
		}
		if (changed) this.checkFeedbacks()
	}

	async init(config: ModuleConfig, _isFirstInit: boolean, secrets: ModuleSecrets): Promise<void> {
		this.config = config
		this.secrets = secrets

		// Register definitions first so actions, feedbacks, variables, and presets are
		// available even when no camera is reachable (e.g. configuring a show offline).
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.updatePresets() // export presets

		// Then attempt to connect; failures here must not block the definitions above.
		await this.configUpdated(config, secrets)
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
		this.stopPolling()
	}

	async configUpdated(config: ModuleConfig, secrets: ModuleSecrets): Promise<void> {
		this.config = config
		this.secrets = secrets
		this.stopPolling()

		if (!config.host) {
			this.status = InstanceStatus.BadConfig
			return
		}

		this.status = InstanceStatus.Connecting
		// Start polling once the first check settles
		void this.checkStatus().finally(() => {
			if (config.polling) {
				this.startPolling(config.interval)
			}
		})
	}

	async checkStatus(): Promise<void> {
		if (this.status === InstanceStatus.AuthenticationFailure) {
			return
		}

		// A previous check is still in flight (e.g. timing out against an unreachable camera);
		if (this.isChecking) {
			return
		}
		this.isChecking = true
		try {
			await this.runStatusCheck()
		} finally {
			this.isChecking = false
		}
	}

	private async runStatusCheck(): Promise<void> {
		if (!this.api) {
			const transport = new SonyPTZ(
				this.config.host,
				this.config.port,
				this.config.user,
				this.secrets.pass,
				this.config.referer,
			)
			this.api = new CameraApi(transport, {
				postCommandRefresh: async (params) => this.refreshFeedbacksAfterCommand(params),
				onError: (e) => {
					if (e instanceof PtzError) this.log('debug', `statusCode = ${e.statusCode}`)
				},
			})
		}

		try {
			const sysinfo = await this.api.query.sysInfo()
			const system = await this.api.query.system()
			const autoFraming = await this.api.query.autoFraming()
			const ptzf = await this.api.query.ptzf()
			const stream = await this.api.query.stream()
			const sceneFile = await this.api.query.sceneFile()

			this.status = InstanceStatus.Ok

			const prevModel = this.state.get('modelName')

			const changed = this.state.update({
				...stateFromSystemInfo(sysinfo, system),
				...stateFromAutoFraming(autoFraming),
				...stateFromPtzf(ptzf),
				...stateFromStream(stream),
				...stateFromSceneFile(sceneFile),
			})
			// Re-export presets when the model is first learned or changes, so the preset list
			// reflects only the connected camera's features.
			if (system.modelName !== prevModel) {
				this.updatePresets()
			}
			if (changed) {
				this.checkFeedbacks()
			}

			const variables: CompanionVariableValues = deriveVariableValues(this.state)
			// Position/exposure values are skipped briefly after a PTZ step so the optimistic
			// local update isn't clobbered by a stale poll reading.
			if (Date.now() - this.lastStepTime >= 3000) {
				const imaging = await this.api.query.imaging()
				const paint = await this.api.query.paint()
				variables.panPos = ptzf.pan
				variables.tiltPos = ptzf.tilt
				variables.zoomPos = ptzf.zoom
				variables.focusPos = ptzf.focus
				variables.exposureGain = imaging.exposureGain
				variables.exposureIris = imaging.exposureIris
				variables.exposureNDVariable = imaging.exposureNDVariable
				variables.masterBlack = paint.masterBlack
			}
			this.setVariableValues(variables)
		} catch (e: any) {
			if (e instanceof PtzError) {
				if (e.statusCode === 401) {
					this.status = InstanceStatus.AuthenticationFailure
				} else {
					this.status = InstanceStatus.ConnectionFailure
				}
			} else {
				this.status = InstanceStatus.UnknownError
			}
		}
	}

	stopPolling(): void {
		clearTimeout(this.timeoutID)
		this.api = undefined
	}

	startPolling(interval: number): void {
		const _func = async () => {
			await this.checkStatus()
			this.timeoutID = setTimeout(() => void _func(), interval)
		}
		this.timeoutID = setTimeout(() => void _func(), interval)
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
