import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModuleInstance } from '../main.js'
import type { Axis, TrackingKind } from '../api/types.js'

const AF_AXIS_CHOICES = [
	{ id: 'Pan', label: 'Pan' },
	{ id: 'Tilt', label: 'Tilt' },
	{ id: 'Zoom', label: 'Zoom' },
]

export function autoFramingActions(self: ModuleInstance): CompanionActionDefinitions {
	return {
		auto_framing_action: {
			name: 'Auto Framing',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'Auto Framing',
					default: 'autoframing_off',
					choices: [
						{ id: 'autoframing_on', label: 'ON' },
						{ id: 'autoframing_off', label: 'OFF' },
						{ id: 'autoframing_pause_on', label: 'Pause ON' },
						{ id: 'autoframing_pause_off', label: 'Pause OFF' },
						{ id: 'autoframing_restart', label: 'Restart' },
					],
				},
			],
			callback: async ({ options }) => {
				switch (options.val) {
					case 'autoframing_on':
						await self.api?.autoFraming.setEnabled(true)
						break
					case 'autoframing_off':
						await self.api?.autoFraming.setEnabled(false)
						break
					case 'autoframing_pause_on':
						await self.api?.autoFraming.pause(true)
						break
					case 'autoframing_pause_off':
						await self.api?.autoFraming.pause(false)
						break
					case 'autoframing_restart':
						await self.api?.autoFraming.restart()
						break
				}
			},
		},
		framing_mode_action: {
			name: 'Framing Mode',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'Framing Mode',
					default: 'autoframing_person',
					choices: [
						{ id: 'autoframing_person', label: 'Person' },
						{ id: 'autoframing_ball', label: 'Ball Sports' },
					],
				},
			],
			callback: async ({ options }) => {
				switch (options.val) {
					case 'autoframing_person':
						await self.api?.autoFraming.setFramingMode('person')
						break
					case 'autoframing_ball':
						await self.api?.autoFraming.setFramingMode('ball_sports')
						break
				}
			},
		},
		lead_room_action: {
			name: 'Lead Room',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'Lead Room',
					default: 'autoframing_leadroom_middle',
					choices: [
						{ id: 'autoframing_leadroom_off', label: 'OFF' },
						{ id: 'autoframing_leadroom_low', label: 'Low' },
						{ id: 'autoframing_leadroom_middle', label: 'Middle' },
						{ id: 'autoframing_leadroom_high', label: 'High' },
					],
				},
			],
			callback: async ({ options }) => {
				switch (options.val) {
					case 'autoframing_leadroom_off':
						await self.api?.autoFraming.setLeadRoom('off')
						break
					case 'autoframing_leadroom_low':
						await self.api?.autoFraming.setLeadRoom('low')
						break
					case 'autoframing_leadroom_middle':
						await self.api?.autoFraming.setLeadRoom('middle')
						break
					case 'autoframing_leadroom_high':
						await self.api?.autoFraming.setLeadRoom('high')
						break
				}
			},
		},
		auto_framing_frame_area_indicator_action: {
			name: 'Auto Framing - Frame/Area Indicator',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'Auto Framing - Frame/Area Indicator',
					default: 'autoframing_faceindicator_on',
					choices: [
						{ id: 'autoframing_faceindicator_on', label: 'ON' },
						{ id: 'autoframing_faceindicator_off', label: 'OFF' },
					],
				},
			],
			callback: async ({ options }) => {
				switch (options.val) {
					case 'autoframing_faceindicator_on':
						await self.api?.autoFraming.setFaceIndicator(true)
						break
					case 'autoframing_faceindicator_off':
						await self.api?.autoFraming.setFaceIndicator(false)
						break
				}
			},
		},
		auto_framing_shot_mode_action: {
			name: 'Auto Framing Shot Mode',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'Auto Framing Shot Mode',
					default: 'autoframing_fullbody',
					choices: [
						{ id: 'autoframing_closer_closeup', label: 'Closer Closeup' },
						{ id: 'autoframing_closeup', label: 'Closeup' },
						{ id: 'autoframing_waist', label: 'Waist' },
						{ id: 'autoframing_fullbody', label: 'Full Body' },
					],
				},
			],
			callback: async ({ options }) => {
				switch (options.val) {
					case 'autoframing_closer_closeup':
						await self.api?.autoFraming.setShotMode('200')
						break
					case 'autoframing_closeup':
						await self.api?.autoFraming.setShotMode('310')
						break
					case 'autoframing_waist':
						await self.api?.autoFraming.setShotMode('510')
						break
					case 'autoframing_fullbody':
						await self.api?.autoFraming.setShotMode('1200')
						break
				}
			},
		},
		auto_framing_start_position_action: {
			name: 'Auto Framing Start Position',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'Auto Framing Start Position',
					default: 'autoframing_startpos_move',
					choices: [
						{ id: 'autoframing_startpos_set', label: 'Decide' },
						{ id: 'autoframing_startpos_move', label: 'Move' },
					],
				},
			],
			callback: async ({ options }) => {
				switch (options.val) {
					case 'autoframing_startpos_set':
						await self.api?.autoFraming.decideStartPosition()
						break
					case 'autoframing_startpos_move':
						await self.api?.autoFraming.moveStartPosition()
						break
				}
			},
		},
		multi_tracking_num_action: {
			name: 'Multi Tracking Num',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'Multi Tracking Num',
					default: 'multitrackingnum_1',
					// '1' disables multi-tracking; 2-8 enable with that target count.
					choices: Array.from({ length: 8 }, (_, i) => ({
						id: `multitrackingnum_${i + 1}`,
						label: `${i + 1}`,
					})),
				},
			],
			callback: async ({ options }) => {
				const targets = Number(String(options.val).replace('multitrackingnum_', ''))
				await self.api?.autoFraming.setMultiTracking(targets)
			},
		},
		multi_tracking_wait_time_action: {
			name: 'Multi Tracking Wait Time',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'Multi Tracking Wait Time',
					default: 'waittime_0',
					choices: Array.from({ length: 61 }, (_, i) => ({ id: `waittime_${i}`, label: `${i}` })),
				},
			],
			callback: async ({ options }) => {
				const seconds = Number(String(options.val).replace('waittime_', ''))
				await self.api?.autoFraming.setWaitTime(seconds)
			},
		},
		fixed_angle_position_action: {
			name: 'Fixed Angle Position',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'Fixed Angle Position',
					default: 'fixedangle_off',
					choices: [
						{ id: 'fixedangle_off', label: 'OFF' },
						{ id: 'fixedangle_on', label: 'ON' },
						{ id: 'fixedangle_store', label: 'Store Current Position' },
						{ id: 'fixedangle_recall', label: 'Recall Position' },
					],
				},
			],
			callback: async ({ options }) => {
				switch (options.val) {
					case 'fixedangle_off':
						await self.api?.autoFraming.fixedAngle.setEnabled(false)
						break
					case 'fixedangle_on':
						await self.api?.autoFraming.fixedAngle.setEnabled(true)
						break
					case 'fixedangle_store':
						await self.api?.autoFraming.fixedAngle.store()
						break
					case 'fixedangle_recall':
						await self.api?.autoFraming.fixedAngle.recall()
						break
				}
			},
		},
		autoframing_tracking_speed_action: {
			name: 'Auto Framing Tracking Speed',
			options: [
				{ id: 'axis', type: 'dropdown', label: 'Axis', choices: AF_AXIS_CHOICES, default: 'Pan' },
				{ id: 'value', type: 'number', label: 'Speed (1-5)', default: 4, min: 1, max: 5 },
			],
			callback: async ({ options }) => {
				await self.api?.autoFraming.setTrackingSpeed(options.axis as Axis, options.value as number)
			},
		},
		autoframing_tracking_sensitivity_action: {
			name: 'Auto Framing Tracking Sensitivity',
			options: [
				{ id: 'axis', type: 'dropdown', label: 'Axis', choices: AF_AXIS_CHOICES, default: 'Pan' },
				{ id: 'value', type: 'number', label: 'Sensitivity (0-5)', default: 3, min: 0, max: 5 },
			],
			callback: async ({ options }) => {
				await self.api?.autoFraming.setTrackingSensitivity(options.axis as Axis, options.value as number)
			},
		},
		autoframing_tracking_step_action: {
			name: 'Auto Framing Tracking Step (Speed/Sensitivity)',
			options: [
				{
					id: 'kind',
					type: 'dropdown',
					label: 'Adjust',
					choices: [
						{ id: 'Speed', label: 'Speed (1-5)' },
						{ id: 'Sensitivity', label: 'Sensitivity (0-5)' },
					],
					default: 'Speed',
				},
				{ id: 'axis', type: 'dropdown', label: 'Axis', choices: AF_AXIS_CHOICES, default: 'Pan' },
				{ id: 'step', type: 'number', label: 'Step', default: 1, min: -5, max: 5 },
			],
			callback: async ({ options }) => {
				const kind = options.kind as TrackingKind
				const axis = options.axis as Axis
				const step = options.step as number
				const min = kind === 'Speed' ? 1 : 0
				const max = 5
				const varName = `tracking${kind}${axis}`
				const current = Number(self.getVariableValue(varName))
				const value = Math.min(Math.max((isNaN(current) ? min : current) + step, min), max)
				self.setVariableValues({ [varName]: value })
				if (kind === 'Speed') await self.api?.autoFraming.setTrackingSpeed(axis, value)
				else await self.api?.autoFraming.setTrackingSensitivity(axis, value)
			},
		},
		fixed_angle_fine_action: {
			name: 'Fixed Angle Fine Adjust',
			options: [
				{
					id: 'target',
					type: 'dropdown',
					label: 'Target',
					choices: [
						{ id: 'pan', label: 'Pan' },
						{ id: 'tilt', label: 'Tilt' },
						{ id: 'zoom', label: 'Zoom' },
					],
					default: 'pan',
				},
				{ id: 'step', type: 'number', label: 'Step', default: 100, min: -32768, max: 32767 },
			],
			callback: async ({ options }) => {
				const axisMap: Record<string, Axis> = { pan: 'Pan', tilt: 'Tilt', zoom: 'Zoom' }
				const axis = axisMap[options.target as string]
				await self.api?.autoFraming.fixedAngle.fineAdjust(axis, options.step as number)
			},
		},
	}
}
