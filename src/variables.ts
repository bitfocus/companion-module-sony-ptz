import type { ModuleInstance } from './main.js'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions([
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
	])
}
