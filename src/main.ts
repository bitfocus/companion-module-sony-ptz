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

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
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
		this.config = config

		// Register definitions first so actions, feedbacks, variables, and presets are
		// available even when no camera is reachable (e.g. configuring a show offline).
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.updatePresets() // export presets

		// Then attempt to connect; failures here must not block the definitions above.
		await this.configUpdated(config)
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
				autoFocusMode: ptzfParams.get('FocusMode') || '',
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

			this.setFeedbackValue(FB_ID.POWER, power)
			this.setFeedbackValue(FB_ID.AUTO_FRAMING, autoFraming)
			this.setFeedbackValue(FB_ID.FRAMING_MODE, framingMode)
			this.setFeedbackValue(FB_ID.SHOT_MODE, shotMode)
			this.setFeedbackValue(FB_ID.LEAD_ROOM, leadRoom)
			this.setFeedbackValue(FB_ID.REALTIME_OVERLAY, realtimeOverlay)
			this.setFeedbackValue(FB_ID.FIXED_ANGLE, fixedAngle)
			this.setFeedbackValue(FB_ID.TRACKING_STATUS, trackingStatus)
			this.setFeedbackValue(FB_ID.SCENE_FILE, sceneFileParams.get('SceneFileCurrentSceneFile') ?? undefined)
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
