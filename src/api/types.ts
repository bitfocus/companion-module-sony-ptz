export type PowerState = 'on' | 'standby'
export type OnOff = 'on' | 'off'
export type FramingMode = 'person' | 'ball_sports'
export type LeadRoomLevel = 'off' | 'low' | 'middle' | 'high'
export type Axis = 'Pan' | 'Tilt' | 'Zoom'
export type PtzDirection = 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right'
export type ZoomDirection = 'tele' | 'wide'
export type StopTarget = 'pantilt' | 'zoom' | 'focus' | 'motor'
export type AFMode = 'normal' | 'interval' | 'zoomtrigger'
export type AFSensitivity = 'normal' | 'low'
export type FocusMode = 'auto' | 'manual'
export type WhiteBalanceMode = 'auto' | 'indoor' | 'outdoor' | 'onepushwb' | 'atw' | 'manual'
export type TrackingKind = 'Speed' | 'Sensitivity'

/** Shot mode is encoded as the zoom field of PtzAutoFramingAdjustSetting ("0,0,<zoom>"). */
export type ShotModeZoom = '200' | '310' | '510' | '1200'

export interface SysInfoStatus {
	power: string
	name: string
	serial: string
	softVersion: string
}

export interface SystemStatus {
	modelName: string
	power: string
	serial: string
	softVersion: string
}

export interface AutoFramingStatus {
	autoFraming: string
	framingMode: string
	/** Raw zoom field of AdjustSetting (e.g. "1200"); friendly name applied at the variable layer. */
	shotMode: string
	/** Normalized to "Off" | "Low" | "Middle" | "High" to match feedback choices. */
	leadRoom: string
	realtimeOverlay: string
	fixedAngle: string
	trackingStatus: string
	trackingSpeed: Record<Axis, string | undefined>
	trackingSensitivity: Record<Axis, string | undefined>
	multiTracking: string | undefined
	/** Configured target count (what presets set), not the live tracked count. */
	multiTrackingTargetNum: string | undefined
	/** Live tracked count (CurrentTargetNum); display only. */
	multiTrackingNum: string
}

export interface PtzfStatus {
	pan: number
	tilt: number
	zoom: number
	focus: number
	panRangeLeft: number
	panRangeRight: number
	tiltRangeLower: number
	tiltRangeUpper: number
	zoomRangeWide: number
	zoomRangeTele: number
	focusMode: string | undefined
	afSensitivity: string | undefined
	afMode: string | undefined
	zoomMode: string
	absoluteFocus: string
}

export interface StreamStatus {
	streamMode: string
}

export interface SceneFileStatus {
	currentSceneFile: string | undefined
	names: Record<string, string>
}

export interface ImagingStatus {
	exposureGain: number
	exposureIris: number
	exposureNDVariable: number
	whiteBalanceMode: string
	whiteBalanceCbGain: number
	whiteBalanceCrGain: number
	stabilizer: string
}

export interface TallyStatus {
	tallyControl: string
	rTallyStatus: string
}

export interface PaintStatus {
	masterBlack: number
}
