import type { ModuleInstance } from './main.js'

export const MAX_FOUND_DEVICES = 8

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const vars = [
		{ variableId: 'modelName', name: 'Model Name' },
		{ variableId: 'name', name: 'Camera Name' },
		{ variableId: 'power', name: 'System Power State' },
		{ variableId: 'softVersion', name: 'Software Version' },
		{ variableId: 'serial', name: 'Serial Number' },
		{ variableId: 'autoFraming', name: 'Auto Framing Status' },
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
		...Array.from({ length: MAX_FOUND_DEVICES }, (_, i) => ({
			variableId: `foundDevice${i + 1}`,
			name: `Found Device ${i + 1}`,
		})),
	]

	self.setVariableDefinitions(vars)
}
