import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig, type ModuleSecrets } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import { SonyPTZ, PtzCommandParams, PtzError } from './sonyptz.js'

const FB_ID = {
	POWER: 'power',
	AUTO_FRAMING: 'autoFraming',
	FRAMING_MODE: 'framingMode',
	SHOT_MODE: 'shotMode',
	LEAD_ROOM: 'leadRoom',
	REALTIME_OVERLAY: 'realtimeOverlay',
	FIXED_ANGLE: 'fixedAngle',
	TRACKING_STATUS: 'trackingStatus',
	SCENE_FILE: 'sceneFile',
}

function splitInt16Array(value: string): number[] {
	return value.split(',').map((x) => (parseInt(x, 16) << 16) >> 16)
}

// AdjustSetting zoom field -> friendly Auto Framing shot mode name
const SHOT_MODE_NAMES: Record<string, string> = {
	'1200': 'Full Body',
	'510': 'Waist',
	'310': 'Closeup',
	'200': 'Closer Closeup',
}

// SceneFileList value is CSV in groups of 3: fileNumber, base64Name, exportable
function parseSceneFileList(raw: string): Record<string, string> {
	const result: Record<string, string> = Object.fromEntries(
		Array.from({ length: 16 }, (_, i) => [`sceneFileName${i + 1}`, 'None']),
	)
	const parts = raw.split(',')
	for (let i = 0; i + 2 < parts.length; i += 3) {
		const fileNum = parseInt(parts[i], 10)
		const name = Buffer.from(parts[i + 1], 'base64').toString('utf8')
		if (fileNum >= 1 && fileNum <= 16) {
			result[`sceneFileName${fileNum}`] = name
		}
	}
	return result
}

const LEAD_ROOM_NAMES: Record<string, string> = {
	off: 'Off',
	low: 'Low',
	middle: 'Middle',
	high: 'High',
}

export class ModuleInstance extends InstanceBase<ModuleConfig, ModuleSecrets> {
	config!: ModuleConfig // Setup in init()
	secrets!: ModuleSecrets // Setup in init()
	ptz?: SonyPTZ
	timeoutID?: ReturnType<typeof setTimeout>
	_status: InstanceStatus = InstanceStatus.Disconnected
	feedbackProperties: { [key: string]: string | boolean | undefined } = {}
	lastStepTime: number = 0

	constructor(internal: unknown) {
		super(internal)
	}

	async sendCommand(path: string, params: PtzCommandParams): Promise<void> {
		try {
			await this.ptz?.send({ path, params })
			// Check feedbacks after command is sent to avoid waiting for the next poll.
			await this.refreshFeedbacksAfterCommand(params)
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

	private applyFeedbacks(inq: string, params: URLSearchParams): void {
		switch (inq) {
			case 'ptzautoframing':
				this.setFeedbackValue(FB_ID.AUTO_FRAMING, params.get('PtzAutoFraming') || '')
				this.setFeedbackValue(FB_ID.FRAMING_MODE, params.get('PtzAutoFramingFramingMode') || '')
				// AdjustSetting inquiry returns "<pan>,<tilt>,<zoom>"; the shot mode is the 3rd field
				this.setFeedbackValue(FB_ID.SHOT_MODE, (params.get('PtzAutoFramingAdjustSetting') || '').split(',')[2] || '')
				this.setFeedbackValue(
					FB_ID.LEAD_ROOM,
					LEAD_ROOM_NAMES[(params.get('PtzAutoFramingLeadRoomLevel') || '').toLowerCase()] ||
						params.get('PtzAutoFramingLeadRoomLevel') ||
						'',
				)
				this.setFeedbackValue(FB_ID.REALTIME_OVERLAY, params.get('PtzAutoFramingFaceIndicatorEnable3') || '')
				// FixedAngleEnable inquiry returns "<number>,<on|off>"; the enabled state is the 2nd field
				this.setFeedbackValue(
					FB_ID.FIXED_ANGLE,
					(params.get('PtzAutoFramingFixedAngleEnable') || '').split(',')[1] || '',
				)
				this.setFeedbackValue(FB_ID.TRACKING_STATUS, params.get('PtzAutoFramingTrackingStatus') || '')
				for (const axis of ['Pan', 'Tilt', 'Zoom']) {
					this.setFeedbackValue(`trackingSpeed${axis}`, params.get(`PtzAutoFramingSpeed${axis}`) || undefined)
					this.setFeedbackValue(
						`trackingSensitivity${axis}`,
						params.get(`PtzAutoFramingSensitivity${axis}`) || undefined,
					)
				}
				this.setFeedbackValue('multiTracking', params.get('PtzAutoFramingMultiTrackingEnable') || undefined)
				// Configured target count (what the preset sets), not the live tracked count
				// (CurrentTargetNum, which is "0,0" when nothing is tracked).
				this.setFeedbackValue('multiTrackingTargetNum', params.get('PtzAutoFramingMultiTrackingTargetNum') || undefined)
				break
			case 'ptzf':
				this.setFeedbackValue('focusMode', params.get('FocusMode') || undefined)
				this.setFeedbackValue('focusSensitivity', params.get('AFSensitivity') || undefined)
				this.setFeedbackValue('afMode', params.get('AFMode') || undefined)
				break
			case 'scenefile':
				this.setFeedbackValue(FB_ID.SCENE_FILE, params.get('SceneFileCurrentSceneFile') ?? undefined)
				break
		}
	}

	private async refreshFeedbacksAfterCommand(params: PtzCommandParams): Promise<void> {
		if (!this.ptz) return
		const inqs = new Set<string>()
		for (const key of Object.keys(params)) {
			if (key.startsWith('PtzAutoFraming')) inqs.add('ptzautoframing')
			else if (key === 'FocusMode' || key === 'AFMode' || key === 'AFSensitivity') inqs.add('ptzf')
			else if (key.startsWith('SceneFile')) inqs.add('scenefile')
			else if (key === 'System') inqs.add('power')
		}
		for (const inq of inqs) {
			try {
				if (inq === 'power') {
					const p = await this.ptz.sendInq({ inq: 'sysinfo' })
					this.setFeedbackValue(FB_ID.POWER, p.get('Power') || '')
				} else {
					this.applyFeedbacks(inq, await this.ptz.sendInq({ inq }))
				}
			} catch {
				// Best-effort: the next regular poll will reconcile if this targeted refresh fails.
			}
		}
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
		await this.checkStatus()

		if (config.polling) {
			this.startPolling(config.interval)
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
				this.secrets.pass,
				this.config.referer,
			)
		}

		try {
			const sysinfoParams = await this.ptz.sendInq({ inq: 'sysinfo' })
			const systemParams = await this.ptz.sendInq({ inq: 'system' })
			const ptzautoframingParams = await this.ptz.sendInq({ inq: 'ptzautoframing' })
			const ptzfParams = await this.ptz.sendInq({ inq: 'ptzf' })
			const streamParams = await this.ptz.sendInq({ inq: 'stream' })
			const sceneFileParams = await this.ptz.sendInq({ inq: 'scenefile' })

			const power = sysinfoParams.get('Power') || systemParams.get('Power') || ''
			const serial = systemParams.get('Serial') || sysinfoParams.get('Serial') || ''
			const version = systemParams.get('SoftVersion') || sysinfoParams.get('SoftVersion') || ''
			const [panPos, tiltPos, zoomPos, focusPos] = splitInt16Array(ptzfParams.get('AbsolutePTZF') || '')
			const [panRangeLeft, panRangeRight] = splitInt16Array(ptzfParams.get('PanMovementRange') || '')
			const [tiltRangeLower, tiltRangeUpper] = splitInt16Array(ptzfParams.get('TiltMovementRange') || '')
			const [zoomRangeWide, zoomRangeTele] = splitInt16Array(ptzfParams.get('ZoomMovementRange') || '')

			const autoFraming = ptzautoframingParams.get('PtzAutoFraming') || ''
			const framingMode = ptzautoframingParams.get('PtzAutoFramingFramingMode') || ''
			// AdjustSetting inquiry returns "<pan>,<tilt>,<zoom>"; the shot mode is the 3rd field
			const shotMode = (ptzautoframingParams.get('PtzAutoFramingAdjustSetting') || '').split(',')[2] || ''
			const leadRoom =
				LEAD_ROOM_NAMES[(ptzautoframingParams.get('PtzAutoFramingLeadRoomLevel') || '').toLowerCase()] ||
				ptzautoframingParams.get('PtzAutoFramingLeadRoomLevel') ||
				''
			const realtimeOverlay = ptzautoframingParams.get('PtzAutoFramingFaceIndicatorEnable3') || ''
			// FixedAngleEnable inquiry returns "<number>,<on|off>"; the enabled state is the 2nd field
			const fixedAngle = (ptzautoframingParams.get('PtzAutoFramingFixedAngleEnable') || '').split(',')[1] || ''
			const trackingStatus = ptzautoframingParams.get('PtzAutoFramingTrackingStatus') || ''

			this.status = InstanceStatus.Ok

			const variables: Record<string, any> = {
				modelName: systemParams.get('ModelName') || '',
				name: sysinfoParams.get('NetworkCameraName') || '',
				power: power,
				serial: serial,
				softVersion: version,
				autoFraming: autoFraming,
				trackingStatus: trackingStatus,
				framingMode: framingMode,
				shotMode: SHOT_MODE_NAMES[shotMode] || shotMode,
				leadRoom: leadRoom,
				realtimeOverlay: realtimeOverlay,
				fixedAngle: fixedAngle,
				trackingSpeedPan: ptzautoframingParams.get('PtzAutoFramingSpeedPan') || '',
				trackingSpeedTilt: ptzautoframingParams.get('PtzAutoFramingSpeedTilt') || '',
				trackingSpeedZoom: ptzautoframingParams.get('PtzAutoFramingSpeedZoom') || '',
				trackingSensitivityPan: ptzautoframingParams.get('PtzAutoFramingSensitivityPan') || '',
				trackingSensitivityTilt: ptzautoframingParams.get('PtzAutoFramingSensitivityTilt') || '',
				trackingSensitivityZoom: ptzautoframingParams.get('PtzAutoFramingSensitivityZoom') || '',
				multiTracking: ptzautoframingParams.get('PtzAutoFramingMultiTrackingEnable') || '',
				multiTrackingNum: ptzautoframingParams.get('PtzAutoFramingMultiTrackingCurrentTargetNum') || '',
				zoomMode: ptzfParams.get('ZoomMode') || '',
				autoFocusMode: ptzfParams.get('AFMode') || '',
				afSensitivity: ptzfParams.get('AFSensitivity') || '',
				focusMode: ptzfParams.get('FocusMode') || '',
				absoluteFocus: ptzfParams.get('AbsoluteFocus') || '',
				panRangeLeft: panRangeLeft,
				panRangeRight: panRangeRight,
				tiltRangeLower: tiltRangeLower,
				tiltRangeUpper: tiltRangeUpper,
				zoomRangeWide: zoomRangeWide,
				zoomRangeTele: zoomRangeTele,
				streamMode: streamParams.get('StreamMode') || '',
				currentSceneFile: sceneFileParams.get('SceneFileCurrentSceneFile') ?? '',
				...parseSceneFileList(sceneFileParams.get('SceneFileList') ?? ''),
			}

			if (Date.now() - this.lastStepTime >= 3000) {
				const imagingParams = await this.ptz.sendInq({ inq: 'imaging' })
				const paintParams = await this.ptz.sendInq({ inq: 'paint' })
				variables.panPos = panPos
				variables.tiltPos = tiltPos
				variables.zoomPos = zoomPos
				variables.focusPos = focusPos
				variables.exposureGain = Number(imagingParams.get('ExposureGain')) || 0
				variables.exposureIris = Number(imagingParams.get('ExposureIris')) || 0
				variables.exposureNDVariable = Number(imagingParams.get('ExposureNDVariable')) || 0
				variables.masterBlack = Number(paintParams.get('MasterBlack')) || 0
			}

			this.setVariableValues(variables)

			// power spans sysinfo+system, so set it from the combined value; the rest map per inquiry.
			this.setFeedbackValue(FB_ID.POWER, power)
			this.applyFeedbacks('ptzautoframing', ptzautoframingParams)
			this.applyFeedbacks('ptzf', ptzfParams)
			this.applyFeedbacks('scenefile', sceneFileParams)
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
