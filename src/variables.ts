import type { CompanionVariableValues } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import type { CameraState, StateKey } from './state/camera-state.js'

export const MAX_FOUND_DEVICES = 8

// AdjustSetting zoom field -> friendly Auto Framing shot mode name (display only).
const SHOT_MODE_NAMES: Record<string, string> = {
	'1200': 'Full Body',
	'510': 'Waist',
	'310': 'Closeup',
	'200': 'Closer Closeup',
}

export function deriveVariableValues(state: CameraState): CompanionVariableValues {
	const str = (key: StateKey): string => {
		const v = state.get(key)
		return v === undefined ? '' : String(v)
	}
	const num = (key: StateKey): number => Number(state.get(key) ?? 0)
	const shot = str('shotMode')

	const sceneFileNames = Object.fromEntries(
		Array.from({ length: 16 }, (_, i) => [`sceneFileName${i + 1}`, str(`sceneFileName${i + 1}`)]),
	)

	return {
		modelName: str('modelName'),
		name: str('name'),
		power: str('power'),
		serial: str('serial'),
		softVersion: str('softVersion'),
		autoFraming: str('autoFraming'),
		trackingStatus: str('trackingStatus'),
		framingMode: str('framingMode'),
		shotMode: SHOT_MODE_NAMES[shot] || shot,
		leadRoom: str('leadRoom'),
		realtimeOverlay: str('realtimeOverlay'),
		fixedAngle: str('fixedAngle'),
		trackingSpeedPan: str('trackingSpeedPan'),
		trackingSpeedTilt: str('trackingSpeedTilt'),
		trackingSpeedZoom: str('trackingSpeedZoom'),
		trackingSensitivityPan: str('trackingSensitivityPan'),
		trackingSensitivityTilt: str('trackingSensitivityTilt'),
		trackingSensitivityZoom: str('trackingSensitivityZoom'),
		multiTracking: str('multiTracking'),
		multiTrackingNum: str('multiTrackingNum'),
		zoomMode: str('zoomMode'),
		autoFocusMode: str('afMode'),
		afSensitivity: str('focusSensitivity'),
		focusMode: str('focusMode'),
		absoluteFocus: str('absoluteFocus'),
		whiteBalanceMode: str('whiteBalanceMode'),
		whiteBalanceCbGain: num('whiteBalanceCbGain'),
		whiteBalanceCrGain: num('whiteBalanceCrGain'),
		stabilizer: str('stabilizer'),
		tallyControl: str('tallyControl'),
		rTallyStatus: str('rTallyStatus'),
		panRangeLeft: num('panRangeLeft'),
		panRangeRight: num('panRangeRight'),
		tiltRangeLower: num('tiltRangeLower'),
		tiltRangeUpper: num('tiltRangeUpper'),
		zoomRangeWide: num('zoomRangeWide'),
		zoomRangeTele: num('zoomRangeTele'),
		streamMode: str('streamMode'),
		currentSceneFile: str('sceneFile'),
		...sceneFileNames,
	}
}

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const vars = [
		{ variableId: 'modelName', name: 'Model Name' },
		{ variableId: 'name', name: 'Camera Name' },
		{ variableId: 'power', name: 'System Power State' },
		{ variableId: 'softVersion', name: 'Software Version' },
		{ variableId: 'serial', name: 'Serial Number' },
		{ variableId: 'autoFraming', name: 'Auto Framing Status' },
		{ variableId: 'trackingStatus', name: 'Auto Framing Tracking Status' },
		{ variableId: 'framingMode', name: 'Framing Mode (Person/Ball Sports)' },
		{ variableId: 'shotMode', name: 'Auto Framing Shot Mode' },
		{ variableId: 'leadRoom', name: 'Lead Room Level' },
		{ variableId: 'realtimeOverlay', name: 'Real-time Overlay (Frame/Area Indicator)' },
		{ variableId: 'fixedAngle', name: 'Fixed Angle Position Enabled' },
		{ variableId: 'trackingSpeedPan', name: 'Auto Framing Tracking Speed - Pan' },
		{ variableId: 'trackingSpeedTilt', name: 'Auto Framing Tracking Speed - Tilt' },
		{ variableId: 'trackingSpeedZoom', name: 'Auto Framing Tracking Speed - Zoom' },
		{ variableId: 'trackingSensitivityPan', name: 'Auto Framing Tracking Sensitivity - Pan' },
		{ variableId: 'trackingSensitivityTilt', name: 'Auto Framing Tracking Sensitivity - Tilt' },
		{ variableId: 'trackingSensitivityZoom', name: 'Auto Framing Tracking Sensitivity - Zoom' },
		{ variableId: 'multiTracking', name: 'Multi Tracking Status' },
		{ variableId: 'multiTrackingNum', name: 'Multi Tracking Target Number' },
		{ variableId: 'zoomMode', name: 'Zoom Mode' },
		{ variableId: 'panPos', name: 'Pan Position' },
		{ variableId: 'tiltPos', name: 'Tilt Position' },
		{ variableId: 'zoomPos', name: 'Zoom Position' },
		{ variableId: 'focusPos', name: 'Focus Position' },
		{ variableId: 'panRangeLeft', name: 'Pan Range - Left' },
		{ variableId: 'panRangeRight', name: 'Pan Range - Right' },
		{ variableId: 'tiltRangeLower', name: 'Tilt Range - Lower' },
		{ variableId: 'tiltRangeUpper', name: 'Tilt Range - Upper' },
		{ variableId: 'zoomRangeWide', name: 'Zoom Range - Wide' },
		{ variableId: 'zoomRangeTele', name: 'Zoom Range - Tele' },
		{ variableId: 'streamMode', name: 'Stream Mode' },
		{ variableId: 'autoFocusMode', name: 'Auto Focus Mode' },
		{ variableId: 'afSensitivity', name: 'Auto Focus Sensitivity' },
		{ variableId: 'focusMode', name: 'Focus Mode' },
		{ variableId: 'absoluteFocus', name: 'Absolute Focus' },
		{ variableId: 'exposureGain', name: 'Exposure Gain' },
		{ variableId: 'exposureIris', name: 'Exposure Iris' },
		{ variableId: 'exposureNDVariable', name: 'Exposure ND Variable' },
		{ variableId: 'masterBlack', name: 'Master Black' },
		{ variableId: 'whiteBalanceMode', name: 'White Balance Mode' },
		{ variableId: 'whiteBalanceCbGain', name: 'White Balance Blue (Cb) Gain' },
		{ variableId: 'whiteBalanceCrGain', name: 'White Balance Red (Cr) Gain' },
		{ variableId: 'stabilizer', name: 'Image Stabilizer' },
		{ variableId: 'tallyControl', name: 'Tally Control' },
		{ variableId: 'rTallyStatus', name: 'Red Tally Status' },
		{ variableId: 'currentSceneFile', name: 'Current Scene File Number' },
		...Array.from({ length: 16 }, (_, i) => ({
			variableId: `sceneFileName${i + 1}`,
			name: `Scene File ${i + 1} Name`,
		})),
		...Array.from({ length: MAX_FOUND_DEVICES }, (_, i) => ({
			variableId: `foundDevice${i + 1}`,
			name: `Found Device ${i + 1}`,
		})),
	]

	self.setVariableDefinitions(vars)
}
