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
			name: 'Auto Framing -  On/Off',
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
			name: 'Auto Framing -  Framing Mode (Person/Ball Sports)',
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
			name: 'Auto Framing -  Shot Mode',
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
			name: 'Auto Framing -  Lead Room',
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
			name: 'Auto Framing -  Fixed Angle Position Enabled',
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
			name: 'Auto Framing -  Tracking Status',
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
		trackingSpeed: {
			type: 'boolean',
			name: 'Auto Framing -  Tracking Speed (matches value)',
			defaultStyle: {
				bgcolor: combineRgb(0, 153, 51),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Axis',
					id: 'axis',
					choices: [
						{ id: 'Pan', label: 'Pan' },
						{ id: 'Tilt', label: 'Tilt' },
						{ id: 'Zoom', label: 'Zoom' },
					],
					default: 'Pan',
				},
				{ type: 'number', label: 'Speed (1-5)', id: 'value', default: 4, min: 1, max: 5 },
			],
			callback: (feedback) => {
				const cur = self.getFeedbackValue(`trackingSpeed${feedback.options.axis}`)
				return cur !== undefined && cur !== '' && Number(cur) === Number(feedback.options.value)
			},
		},
		trackingSensitivity: {
			type: 'boolean',
			name: 'Auto Framing -  Tracking Sensitivity (matches value)',
			defaultStyle: {
				bgcolor: combineRgb(0, 153, 51),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Axis',
					id: 'axis',
					choices: [
						{ id: 'Pan', label: 'Pan' },
						{ id: 'Tilt', label: 'Tilt' },
						{ id: 'Zoom', label: 'Zoom' },
					],
					default: 'Pan',
				},
				{ type: 'number', label: 'Sensitivity (0-5)', id: 'value', default: 3, min: 0, max: 5 },
			],
			callback: (feedback) => {
				const cur = self.getFeedbackValue(`trackingSensitivity${feedback.options.axis}`)
				return cur !== undefined && cur !== '' && Number(cur) === Number(feedback.options.value)
			},
		},
		multiTracking: {
			type: 'boolean',
			name: 'Auto Framing -  Multi Tracking Targets',
			defaultStyle: {
				bgcolor: combineRgb(0, 153, 51),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Targets',
					id: 'num',
					choices: [
						{ id: '1', label: 'Off (single)' },
						...Array.from({ length: 7 }, (_, i) => ({ id: `${i + 2}`, label: `${i + 2} Targets` })),
					],
					default: '1',
				},
			],
			callback: (feedback) => {
				const enable = self.getFeedbackValue('multiTracking')
				if (feedback.options.num === '1') return enable === 'off'
				return (
					enable === 'on' && String(self.getFeedbackValue('multiTrackingTargetNum')) === String(feedback.options.num)
				)
			},
		},
		focusMode: {
			type: 'boolean',
			name: 'Focus -  Focus Mode (Auto/Manual)',
			defaultStyle: {
				bgcolor: combineRgb(0, 153, 51),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Focus Mode',
					id: 'mode',
					choices: [
						{ id: 'auto', label: 'Auto' },
						{ id: 'manual', label: 'Manual' },
					],
					default: 'auto',
				},
			],
			callback: (feedback) => self.getFeedbackValue('focusMode') === feedback.options.mode,
		},
		afMode: {
			type: 'boolean',
			name: 'Focus -  Auto Focus Mode',
			defaultStyle: {
				bgcolor: combineRgb(0, 153, 51),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'AF Mode',
					id: 'mode',
					choices: [
						{ id: 'normal', label: 'Normal' },
						{ id: 'interval', label: 'Interval' },
						{ id: 'zoomtrigger', label: 'Zoom Trigger' },
					],
					default: 'normal',
				},
			],
			callback: (feedback) => self.getFeedbackValue('afMode') === feedback.options.mode,
		},
		focusSensitivity: {
			type: 'boolean',
			name: 'Focus -  Auto Focus Sensitivity',
			defaultStyle: {
				bgcolor: combineRgb(0, 153, 51),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Sensitivity',
					id: 'level',
					choices: [
						{ id: 'normal', label: 'Normal' },
						{ id: 'low', label: 'Low' },
					],
					default: 'normal',
				},
			],
			callback: (feedback) => self.getFeedbackValue('focusSensitivity') === feedback.options.level,
		},
	})
}
