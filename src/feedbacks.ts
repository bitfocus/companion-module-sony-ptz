import { combineRgb } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		power: {
			type: 'boolean',
			name: 'System power',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Power',
					id: 'power',
					choices: [
						{ id: 'on', label: 'On' },
						{ id: 'standby', label: 'Standby' },
					],
					default: 'standby',
				},
			],
			callback: (feedback) => {
				self.log('debug', `power: ${self.getFeedbackValue('power')}`)
				return self.getFeedbackValue('power') === feedback.options.power
			},
		},
		framingMode: {
			type: 'boolean',
			name: 'Auto Framing: Framing Mode (Person/Ball Sports)',
			defaultStyle: {
				bgcolor: combineRgb(0, 102, 204),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Framing Mode',
					id: 'mode',
					choices: [
						{ id: 'person', label: 'Person' },
						{ id: 'ball_sports', label: 'Ball Sports' },
					],
					default: 'person',
				},
			],
			callback: (feedback) => self.getFeedbackValue('framingMode') === feedback.options.mode,
		},
		leadRoom: {
			type: 'boolean',
			name: 'Auto Framing: Lead Room Effect',
			defaultStyle: {
				bgcolor: combineRgb(0, 102, 204),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Lead Room Effect',
					id: 'level',
					choices: [
						{ id: 'off', label: 'Off' },
						{ id: 'low', label: 'Low' },
						{ id: 'middle', label: 'Middle' },
						{ id: 'high', label: 'High' },
					],
					default: 'off',
				},
			],
			callback: (feedback) => self.getFeedbackValue('leadRoom') === feedback.options.level,
		},
		autoFramingFrameAreaIndicator: {
			type: 'boolean',
			name: 'Auto Framing - Frame/Area Indicator',
			defaultStyle: {
				bgcolor: combineRgb(0, 102, 204),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Overlay',
					id: 'state',
					choices: [
						{ id: 'on', label: 'On' },
						{ id: 'off', label: 'Off' },
					],
					default: 'on',
				},
			],
			callback: (feedback) => self.getFeedbackValue('realtimeOverlay') === feedback.options.state,
		},
		fixedAngle: {
			type: 'boolean',
			name: 'Auto Framing: Fixed Angle Position Enabled',
			defaultStyle: {
				bgcolor: combineRgb(0, 102, 204),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Fixed Angle Position',
					id: 'state',
					choices: [
						{ id: 'on', label: 'On' },
						{ id: 'off', label: 'Off' },
					],
					default: 'on',
				},
			],
			callback: (feedback) => self.getFeedbackValue('fixedAngle') === feedback.options.state,
		},
		trackingStatus: {
			type: 'boolean',
			name: 'Auto Framing: Tracking Status',
			defaultStyle: {
				bgcolor: combineRgb(0, 153, 51),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Tracking Status',
					id: 'status',
					choices: [
						{ id: 'idle', label: 'Idle' },
						{ id: 'missing', label: 'Missing (tracking lost)' },
						{ id: 'preparing', label: 'Preparing' },
						{ id: 'searching', label: 'Searching' },
						{ id: 'tracking', label: 'Tracking' },
						{ id: 'waiting', label: 'Waiting' },
						{ id: 'fixed_angle', label: 'Fixed Angle' },
					],
					default: 'tracking',
				},
			],
			callback: (feedback) => self.getFeedbackValue('trackingStatus') === feedback.options.status,
		},
	})
}
