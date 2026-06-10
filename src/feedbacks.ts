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
		autoFraming: {
			type: 'boolean',
			name: 'Auto Framing: On/Off',
			defaultStyle: {
				bgcolor: combineRgb(0, 153, 51),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'State',
					id: 'state',
					choices: [
						{ id: 'on', label: 'On' },
						{ id: 'off', label: 'Off' },
					],
					default: 'on',
				},
			],
			callback: (feedback) => self.getFeedbackValue('autoFraming') === feedback.options.state,
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
		shotMode: {
			type: 'boolean',
			name: 'Auto Framing: Shot Mode',
			defaultStyle: {
				bgcolor: combineRgb(0, 102, 204),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Shot Mode',
					id: 'mode',
					choices: [
						{ id: '1200', label: 'Full Body' },
						{ id: '510', label: 'Waist' },
						{ id: '310', label: 'Closeup' },
						{ id: '200', label: 'Closer Closeup' },
					],
					default: '1200',
				},
			],
			// AdjustSetting inquiry returns "<pan>,<tilt>,<zoom>"; the shot mode is the 3rd field
			callback: (feedback) => self.getFeedbackValue('shotMode') === feedback.options.mode,
		},
		leadRoom: {
			type: 'boolean',
			name: 'Auto Framing: Lead Room',
			defaultStyle: {
				bgcolor: combineRgb(0, 102, 204),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Lead Room',
					id: 'level',
					choices: [
						{ id: 'Off', label: 'Off' },
						{ id: 'Low', label: 'Low' },
						{ id: 'Middle', label: 'Middle' },
						{ id: 'High', label: 'High' },
					],
					default: 'Off',
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
		sceneFile: {
			type: 'boolean',
			name: 'Scene File: Current Scene File',
			defaultStyle: {
				bgcolor: combineRgb(0, 102, 204),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Scene File',
					id: 'file',
					choices: [
						{ id: '0', label: 'Off' },
						...Array.from({ length: 16 }, (_, i) => ({ id: `${i + 1}`, label: `Scene File ${i + 1}` })),
					],
					default: '1',
				},
			],
			callback: (feedback) => self.getFeedbackValue('sceneFile') === feedback.options.file,
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
