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
		{ variableId: 'streamMode', name: 'Stream Mode' },
	])
}
