import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import { SonyPTZ, PtzCommandParams, PtzError } from './sonyptz.js'

const FB_ID = {
	POWER: 'power',
}

function splitInt16Array(value: string): number[] {
	return value.split(',').map((x) => (parseInt(x, 16) << 16) >> 16)
}

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	ptz?: SonyPTZ
	timeoutID?: ReturnType<typeof setTimeout>
	_status: InstanceStatus = InstanceStatus.Disconnected
	feedbackProperties: { [key: string]: string | boolean | undefined } = {}

	constructor(internal: unknown) {
		super(internal)
	}

	async sendCommand(path: string, params: PtzCommandParams): Promise<void> {
		try {
			await this.ptz?.send({ path, params })
		} catch (e: any) {
			if (e instanceof PtzError) {
				this.log('debug', `statusCode = ${e.statusCode}`)
			}
		}
	}

	private set status(status: InstanceStatus) {
		this._status = status
		this.updateStatus(status)
	}

	private get status(): InstanceStatus {
		return this._status
	}

	getFeedbackValue(id: string): string | boolean | undefined {
		return this.feedbackProperties[id]
	}

	private setFeedbackValue(id: string, value: string | boolean | undefined) {
		if (this.feedbackProperties[id] !== value) {
			this.feedbackProperties[id] = value
			//this.checkFeedbacksById(id);
			this.checkFeedbacks()
		}
	}

	async init(config: ModuleConfig): Promise<void> {
		await this.configUpdated(config)
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.updatePresets() // export presets
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
		this.stopPolling()
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		this.stopPolling()

		if (!config.host) {
			this.status = InstanceStatus.BadConfig
			return
		}

		try {
			await this.checkStatus()
		} catch (e: any) {
			this.log('debug', `checkStatus error: ${e.message}`)
		}

		if (config.polling) {
			this.status = InstanceStatus.Connecting
			this.startPolling(config.interval)
		} else {
			this.status = InstanceStatus.Ok
		}
	}

	async checkStatus(): Promise<void> {
		if (this.status === InstanceStatus.AuthenticationFailure) {
			return
		}

		if (!this.ptz) {
			this.ptz = new SonyPTZ(
				this.config.host,
				this.config.port,
				this.config.user,
				this.config.pass,
				this.config.referer,
			)
		}

		try {
			const sysinfoParams = await this.ptz.sendInq({ inq: 'sysinfo' })
			const systemParams = await this.ptz.sendInq({ inq: 'system' })
			const ptzautoframingParams = await this.ptz.sendInq({ inq: 'ptzautoframing' })
			const ptzfParams = await this.ptz.sendInq({ inq: 'ptzf' })
			const streamParams = await this.ptz.sendInq({ inq: 'stream' })

			const power = sysinfoParams.get('Power') || systemParams.get('Power') || ''
			const serial = systemParams.get('Serial') || sysinfoParams.get('Serial') || ''
			const version = systemParams.get('SoftVersion') || sysinfoParams.get('SoftVersion') || ''
			const [panPos, tiltPos, zoomPos, focusPos] = splitInt16Array(ptzfParams.get('AbsolutePTZF') || '')
			const [panRangeLeft, panRangeRight] = splitInt16Array(ptzfParams.get('PanMovementRange') || '')
			const [tiltRangeLower, tiltRangeUpper] = splitInt16Array(ptzfParams.get('TiltMovementRange') || '')
			const [zoomRangeWide, zoomRangeTele] = splitInt16Array(ptzfParams.get('ZoomMovementRange') || '')

			this.status = InstanceStatus.Ok

			this.setVariableValues({
				modelName: systemParams.get('ModelName') || '',
				name: sysinfoParams.get('NetworkCameraName') || '',
				power: power,
				serial: serial,
				softVersion: version,
				autoFraming: ptzautoframingParams.get('PtzAutoFraming') || '',
				multiTracking: ptzautoframingParams.get('PtzAutoFramingMultiTrackingEnable') || '',
				multiTrackingNum: ptzautoframingParams.get('PtzAutoFramingMultiTrackingCurrentTargetNum') || '',
				zoomMode: ptzfParams.get('ZoomMode') || '',
				autoFocusMode: ptzfParams.get('FocusMode') || '',
				afSensitivity: ptzfParams.get('AFSensitivity') || '',
				focusMode: ptzfParams.get('FocusMode') || '',
				absoluteFocus: ptzfParams.get('AbsoluteFocus') || '',
				panPos: panPos,
				tiltPos: tiltPos,
				zoomPos: zoomPos,
				focusPos: focusPos,
				panRangeLeft: panRangeLeft,
				panRangeRight: panRangeRight,
				tiltRangeLower: tiltRangeLower,
				tiltRangeUpper: tiltRangeUpper,
				zoomRangeWide: zoomRangeWide,
				zoomRangeTele: zoomRangeTele,
				streamMode: streamParams.get('StreamMode') || '',
			})

			this.setFeedbackValue(FB_ID.POWER, power)
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
		this.ptz = undefined
	}

	startPolling(interval: number): void {
		const _func = async () => {
			await this.checkStatus()
			this.timeoutID = setTimeout(() => void _func(), interval)
		}
		this.timeoutID = setTimeout(() => void _func(), interval)
	}

	// Return config fields for web config
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
