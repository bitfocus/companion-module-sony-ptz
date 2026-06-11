import type { ModuleInstance } from './main.js'
import {
	combineRgb,
	CompanionFeedbackButtonStyleResult,
	CompanionPresetDefinition,
	CompanionPresetDefinitions,
	CompanionPresetFeedback,
} from '@companion-module/base'
import { DEFAULT_PTZ_MOVE_SPEED, DEFAULT_PTZ_ZOOM_SPEED, DEFAULT_PTZ_STEP, SPEED_PARAM_ACTIONS } from './actions.js'

type PresetSpec = [
	category: string,
	name: string,
	text: string,
	key: string,
	down: [string, string, number][],
	up: [string, string, number][],
	// Use the CompanionPresetFeedback shape: { feedbackId, options, style?, isInverted? }.
	// When a feedback omits `style`, the builder falls back to DEFAULT_ACTIVE_STYLE.
	feedbacks?: CompanionPresetFeedback[],
]
type RotaryPresetSpec = [string, string, string, string, [string, any], [string, any], CompanionPresetFeedback[]?]
// Button preset that pushes one action with an explicit options object (for actions
// whose options don't fit the simple `{ val: choiceId }` shape used by PRESET_LIST).
type GenericButtonPresetSpec = [
	category: string,
	name: string,
	text: string,
	key: string,
	down: [actionId: string, options: Record<string, any>][],
	feedbacks?: CompanionPresetFeedback[],
]
type GenericRotaryPresetSpec = [
	string,
	string,
	string,
	string,
	[string, any],
	[string, any],
	CompanionPresetFeedback[]?,
]

const FONT_SIZE = 12
const SPEED_PARAM_ACTION_IDS = SPEED_PARAM_ACTIONS.map((x) => x.toLowerCase().split(' ').join('_') + '_action')

// Default highlight applied to a preset feedback when it does not specify its own style.
const DEFAULT_ACTIVE_STYLE: CompanionFeedbackButtonStyleResult = {
	bgcolor: combineRgb(0, 153, 51),
	color: combineRgb(255, 255, 255),
}

// Normalize a spec's optional feedback list into CompanionPresetFeedback entries.
function buildPresetFeedbacks(feedbacks?: CompanionPresetFeedback[]): CompanionPresetFeedback[] {
	return (feedbacks ?? []).map((fb) => ({ ...fb, style: fb.style ?? DEFAULT_ACTIVE_STYLE }))
}

export function UpdatePresets(self: ModuleInstance): void {
	const PRESET_LIST: PresetSpec[] = [
		// [category, name, text, key, down[actionId, choiceId, delay][], up[actionId, choiceId, delay]]
		[
			'System',
			'On',
			'PTZ\\nOn',
			'system_on',
			[['system_power_action', 'system_on', 0]],
			[],
			[{ feedbackId: 'power', options: { power: 'on' } }],
		],
		[
			'System',
			'Standby',
			'PTZ\\nStandby',
			'system_standby',
			[['system_power_action', 'system_standby', 0]],
			[],
			[{ feedbackId: 'power', options: { power: 'standby' } }],
		],
		[
			'Auto Framing - Controls',
			'On',
			'Auto Framing\\nOn',
			'autoframing_on',
			[['auto_framing_action', 'autoframing_on', 0]],
			[],
			[{ feedbackId: 'autoFraming', options: { state: 'on' } }],
		],
		[
			'Auto Framing - Controls',
			'Off',
			'Auto Framing\\nOff',
			'autoframing_off',
			[['auto_framing_action', 'autoframing_off', 0]],
			[],
			[{ feedbackId: 'autoFraming', options: { state: 'off' } }],
		],
		[
			'Auto Framing - Controls',
			'Pause On',
			'Auto Framing\\nPause On',
			'autoframing_pause_on',
			[['auto_framing_action', 'autoframing_pause_on', 0]],
			[],
		],
		[
			'Auto Framing - Controls',
			'Pause Off',
			'Auto Framing\\nPause Off',
			'autoframing_pause_off',
			[['auto_framing_action', 'autoframing_pause_off', 0]],
			[],
		],
		[
			'Auto Framing - Controls',
			'Restart',
			'Auto Framing\\nRestart',
			'autoframing_restart',
			[['auto_framing_action', 'autoframing_restart', 0]],
			[],
		],
		[
			'Auto Framing - Controls',
			'Home',
			'Auto Framing\\nHome',
			'autoframing_home',
			[['preset_call_action', 'autoframing_home', 0]],
			[],
		],
		// Person/Ball Sports Framing switching (Framing Mode action)
		[
			'Auto Framing - Mode',
			'Person',
			'Framing\\nPerson',
			'autoframing_person',
			[['framing_mode_action', 'autoframing_person', 0]],
			[],
			[{ feedbackId: 'framingMode', options: { mode: 'person' } }],
		],

		[
			'Auto Framing - Mode',
			'Ball Sports',
			'Framing\\nBall',
			'autoframing_ball',
			[['framing_mode_action', 'autoframing_ball', 0]],
			[],
			[{ feedbackId: 'framingMode', options: { mode: 'ball_sports' } }],
		],
		//Shot Mode
		[
			'Auto Framing - Shot Mode',
			'Mode:Fullbody',
			'AF Mode\\nFullbody',
			'autoframing_fullbody',
			[['auto_framing_shot_mode_action', 'autoframing_fullbody', 0]],
			[],
			[{ feedbackId: 'shotMode', options: { mode: '1200' } }],
		],
		[
			'Auto Framing - Shot Mode',
			'Mode:Waist',
			'AF Mode\\nWaist',
			'autoframing_waist',
			[['auto_framing_shot_mode_action', 'autoframing_waist', 0]],
			[],
			[{ feedbackId: 'shotMode', options: { mode: '510' } }],
		],
		[
			'Auto Framing - Shot Mode',
			'Mode:Closeup',
			'AF Mode\\nCloseup',
			'autoframing_closeup',
			[['auto_framing_shot_mode_action', 'autoframing_closeup', 0]],
			[],
			[{ feedbackId: 'shotMode', options: { mode: '310' } }],
		],
		[
			'Auto Framing - Shot Mode',
			'Mode:Closer Closeup',
			'AF Mode\\nCloser Closeup',
			'autoframing_closer_closeup',
			[['auto_framing_shot_mode_action', 'autoframing_closer_closeup', 0]],
			[],
			[{ feedbackId: 'shotMode', options: { mode: '200' } }],
		],
		// Lead Room

		[
			'Auto Framing - Lead Room',
			'Off',
			'Lead Room\\nOff',
			'autoframing_leadroom_off',
			[['lead_room_action', 'autoframing_leadroom_off', 0]],
			[],
			[{ feedbackId: 'leadRoom', options: { level: 'Off' } }],
		],

		[
			'Auto Framing - Lead Room',
			'Low',
			'Lead Room\\nLow',
			'autoframing_leadroom_low',
			[['lead_room_action', 'autoframing_leadroom_low', 0]],
			[],
			[{ feedbackId: 'leadRoom', options: { level: 'Low' } }],
		],

		[
			'Auto Framing - Lead Room',
			'Middle',
			'Lead Room\\nMiddle',
			'autoframing_leadroom_middle',
			[['lead_room_action', 'autoframing_leadroom_middle', 0]],
			[],
			[{ feedbackId: 'leadRoom', options: { level: 'Middle' } }],
		],

		[
			'Auto Framing - Lead Room',
			'High',
			'Lead Room\\nHigh',
			'autoframing_leadroom_high',
			[['lead_room_action', 'autoframing_leadroom_high', 0]],
			[],
			[{ feedbackId: 'leadRoom', options: { level: 'High' } }],
		],
		// Real-time Overlay (Frame/Area Indicator)

		[
			'Auto Framing - Frame/Area Indicator',
			'On',
			'Overlay\\nOn',
			'autoframing_faceindicator_on',
			[],
			[],
			[{ feedbackId: 'autoFramingFrameAreaIndicator', options: { state: 'on' } }],
		],

		[
			'Auto Framing - Frame/Area Indicator',
			'Off',
			'Overlay\\nOff',
			'autoframing_faceindicator_off',
			[],
			[],
			[{ feedbackId: 'autoFramingFrameAreaIndicator', options: { state: 'off' } }],
		],
		// Fixed Angle Position (SRG-A40/A12) — Store/Recall are momentary, no state feedback

		[
			'Auto Framing - Fixed Angle Position',
			'Off',
			'Fixed Angle\\nOff',
			'fixedangle_off',
			[['fixed_angle_position_action', 'fixedangle_off', 0]],
			[],
			[{ feedbackId: 'fixedAngle', options: { state: 'off' } }],
		],

		[
			'Auto Framing - Fixed Angle Position',
			'On',
			'Fixed Angle\\nOn',
			'fixedangle_on',
			[['fixed_angle_position_action', 'fixedangle_on', 0]],
			[],
			[{ feedbackId: 'fixedAngle', options: { state: 'on' } }],
		],
		[
			'Auto Framing - Fixed Angle Position',
			'Store',
			'Fixed Angle\\nStore',
			'fixedangle_store',
			[['fixed_angle_position_action', 'fixedangle_store', 0]],
			[],
		],
		[
			'Auto Framing - Fixed Angle Position',
			'Recall',
			'Fixed Angle\\nRecall',
			'fixedangle_recall',
			[['fixed_angle_position_action', 'fixedangle_recall', 0]],
			[],
		],
		[
			'Pan/Tilt/Zoom - Pan/Tilt',
			'Up',
			'Tilt Up',
			'ptz_move_up',
			[['ptz_move_action', 'move_up', 0]],
			[['ptz_move_stop_action', 'stop_pantilt', 0]],
		],
		[
			'Pan/Tilt/Zoom - Pan/Tilt',
			'Down',
			'Tilt Down',
			'ptz_move_down',
			[['ptz_move_action', 'move_down', 0]],
			[['ptz_move_stop_action', 'stop_pantilt', 0]],
		],
		[
			'Pan/Tilt/Zoom - Pan/Tilt',
			'Left',
			'Pan Left',
			'ptz_move_left',
			[['ptz_move_action', 'move_left', 0]],
			[['ptz_move_stop_action', 'stop_pantilt', 0]],
		],
		[
			'Pan/Tilt/Zoom - Pan/Tilt',
			'Right',
			'Pan Right',
			'ptz_move_right',
			[['ptz_move_action', 'move_right', 0]],
			[['ptz_move_stop_action', 'stop_pantilt', 0]],
		],
		[
			'Pan/Tilt/Zoom - Pan/Tilt',
			'Up Left',
			'Tilt Up Left',
			'ptz_move_up_left',
			[['ptz_move_action', 'move_up_left', 0]],
			[['ptz_move_stop_action', 'stop_pantilt', 0]],
		],
		[
			'Pan/Tilt/Zoom - Pan/Tilt',
			'Up Right',
			'Tilt Up Right',
			'ptz_move_up_right',
			[['ptz_move_action', 'move_up_right', 0]],
			[['ptz_move_stop_action', 'stop_pantilt', 0]],
		],
		[
			'Pan/Tilt/Zoom - Pan/Tilt',
			'Down Left',
			'Tilt Down Left',
			'ptz_move_down_left',
			[['ptz_move_action', 'move_down_left', 0]],
			[['ptz_move_stop_action', 'stop_pantilt', 0]],
		],
		[
			'Pan/Tilt/Zoom - Pan/Tilt',
			'Down Right',
			'Tilt Down Right',
			'ptz_move_down_right',
			[['ptz_move_action', 'move_down_right', 0]],
			[['ptz_move_stop_action', 'stop_pantilt', 0]],
		],
		[
			'Pan/Tilt/Zoom - Zoom',
			'Tele',
			'Zoom Tele',
			'ptz_zoom_tele',
			[['ptz_zoom_action', 'zoom_tele', 0]],
			[['ptz_move_stop_action', 'stop_zoom', 0]],
		],
		[
			'Pan/Tilt/Zoom - Zoom',
			'Wide',
			'Zoom Wide',
			'ptz_zoom_wide',
			[['ptz_zoom_action', 'zoom_wide', 0]],
			[['ptz_move_stop_action', 'stop_zoom', 0]],
		],
		['Preset Call', 'Look Back', 'PTZ Preset\\nBack', 'preset_back', [], []],
		['Preset Call', 'PTZ Home', 'PTZ Preset\\nHome', 'preset_home', [], []],
		[
			'Auto Focus - Focus Mode',
			'ON',
			'Auto Focus\\nON',
			'auto_focus_auto',
			[['focus_mode_action', 'focus_auto', 0]],
			[],
		],
		[
			'Auto Focus - Focus Mode',
			'OFF',
			'Manual Focus',
			'auto_focus_manual',
			[['focus_mode_action', 'focus_manual', 0]],
			[],
		],
		[
			'Auto Focus - AF Mode',
			'Normal Mode',
			'Auto Focus\\nNormal Mode',
			'afmode_normal',
			[['auto_focus_mode_action', 'afmode_normal', 0]],
			[],
		],
		[
			'Auto Focus - AF Mode',
			'Interval Mode',
			'Auto Focus\\nInterval Mode',
			'afmode_interval',
			[['auto_focus_mode_action', 'afmode_interval', 0]],
			[],
		],
		[
			'Auto Focus - AF Mode',
			'Zoom Trigger Mode',
			'Auto Focus\\nZoom Trigger',
			'afmode_zoomtrigger',
			[['auto_focus_mode_action', 'afmode_zoomtrigger', 0]],
			[],
		],
		[
			'Auto Focus - Sensitivity',
			'Normal Sensitivity',
			'Auto Focus\\nNormal Sensitivity',
			'afsensitivity_normal',
			[['auto_focus_sensitivity_action', 'afsensitivity_normal', 0]],
			[],
		],
		[
			'Auto Focus - Sensitivity',
			'Low Sensitivity',
			'Auto Focus\\nLow Sensitivity',
			'afsensitivity_low',
			[['auto_focus_sensitivity_action', 'afsensitivity_low', 0]],
			[],
		],
		[
			'Auto Framing - Multi Tracking',
			'OFF',
			'Multi Tracking OFF',
			'multitrackingnum_1',
			[['multi_tracking_num_action', 'multitrackingnum_1', 0]],
			[],
		],
		// @ts-expect-error  The first param 'x' will not be used
		...[...Array(7)].map((x, i) => [
			'Auto Framing - Multi Tracking',
			`${i + 2}`,
			`Multi Tracking Targets\n${i + 2}`,
			`multitrackingnum_${i + 2}`,
			[['multi_tracking_num_action', `multitrackingnum_${i + 2}`, 0]],
			[],
		]),
		// @ts-expect-error  The first param 'x' will not be used
		...[...Array(10)].map((x, i) => ['Preset Call', `${i + 1}`, `PTZ Preset ${i + 1}`, `preset_${i + 1}`, [], []]),
		// @ts-expect-error  The first param 'x' will not be used
		...[...Array(10)].map((x, i) => [
			'Preset Set',
			`${i + 1}`,
			`PTZ Preset Set ${i + 1}`,
			`preset_set_${i + 1}`,
			[],
			[],
		]),
		// @ts-expect-error  The first param 'x' will not be used
		...[...Array(17)].map((x, i) => [
			'Scene File Recall',
			i === 0 ? 'Off' : `${i}`,
			i === 0 ? 'Scene File\\nOff' : `Scene File ${i}`,
			i === 0 ? 'scenefile_off' : `scenefile_set_${i}`,
			[],
			[],
		]),
	]

	const presets: CompanionPresetDefinitions = {}

	// Map each authoring category to a broad top-level group plus a sub-section label.
	// Buttons are grouped under the top-level category; the sub-label becomes a `type: 'text'`
	// header inserted once before the group's first button. Categories absent from the map are
	// left as their own single-section group (no sub-header).
	const CATEGORY_MAP: Record<string, [topCategory: string, subLabel: string]> = {
		'Auto Framing - Controls': ['Auto Framing', 'Controls'],
		'Auto Framing - Mode': ['Auto Framing', 'Framing Mode'],
		'Auto Framing - Shot Mode': ['Auto Framing', 'Shot Mode'],
		'Auto Framing - Lead Room': ['Auto Framing', 'Lead Room'],
		'Auto Framing - Frame/Area Indicator': ['Auto Framing', 'Frame/Area Indicator'],
		'Auto Framing - Fixed Angle Position': ['Auto Framing', 'Fixed Angle Position'],
		'Auto Framing - Multi Tracking': ['Auto Framing', 'Multi Tracking'],
		'Auto Framing - Tracking Speed': ['Auto Framing', 'Tracking Speed'],
		'Auto Framing - Tracking Sensitivity': ['Auto Framing', 'Tracking Sensitivity'],
		'Auto Framing - Fixed Angle Fine Adjust': ['Auto Framing', 'Fixed Angle Fine Adjust'],
		'Pan/Tilt/Zoom - Pan/Tilt': ['Pan/Tilt/Zoom', 'Pan / Tilt'],
		'Pan/Tilt/Zoom - Zoom': ['Pan/Tilt/Zoom', 'Zoom'],
		'Auto Focus - Focus Mode': ['Focus Controls', 'Focus Mode'],
		'Auto Focus - AF Mode': ['Focus Controls', 'AF Mode'],
		'Auto Focus - Sensitivity': ['Focus Controls', 'Sensitivity'],
		'Preset Call': ['PTZ Presets', 'Recall'],
		'Preset Set': ['PTZ Presets', 'Store'],
		'Rotary Presets': ['Rotary', 'Pan / Tilt / Zoom'],
		'Rotary (BRC-AM7)': ['Rotary', 'BRC-AM7'],
		'Rotary (SRG-A12/A40)': ['Rotary', 'SRG-A12/A40'],
	}

	const seenSubHeaders = new Set<string>()
	// Resolve an authoring category to its top-level group, emitting a one-time text header
	// for the sub-section the first time it is encountered. Returns the top-level category to
	// assign to the button preset.
	function resolveCategory(authorCategory: string): string {
		const [top, sub] = CATEGORY_MAP[authorCategory] ?? [authorCategory, authorCategory]
		if (sub !== top && !seenSubHeaders.has(`${top}::${sub}`)) {
			seenSubHeaders.add(`${top}::${sub}`)
			const headerKey = `zz_header_${`${top}_${sub}`.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`
			presets[headerKey] = { type: 'text', category: top, name: sub, text: '' }
		}
		return top
	}

	// 0:category, 1:name, 2:text, 3:key, 4:[actionId, choiceId, delay][]
	PRESET_LIST.forEach((item) => {
		const downSteps = item[4]
		const upSteps = item[5]

		const preset: CompanionPresetDefinition = {
			type: 'button',
			category: resolveCategory(item[0]),
			name: item[1],
			style: {
				text: item[2],
				size: FONT_SIZE,
				show_topbar: false,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [{ down: [], up: [] }],
			feedbacks: buildPresetFeedbacks(item[6]),
		}

		downSteps.forEach((step) => {
			preset.steps[0].down.push({
				actionId: step[0],
				options: SPEED_PARAM_ACTION_IDS.includes(step[0])
					? // Move/Zoom speed use variable-enabled text fields, so the default must be a string
						{
							val: step[1],
							speed: (step[0] === 'ptz_move_action' ? DEFAULT_PTZ_MOVE_SPEED : DEFAULT_PTZ_ZOOM_SPEED).toString(),
						}
					: { val: step[1] },
				delay: step[2],
			})
		})

		upSteps.forEach((step) => {
			preset.steps[0].up.push({
				actionId: step[0],
				options: { val: step[1] },
				delay: step[2],
			})
		})

		if (downSteps.length == 0) {
			preset.steps[0].down.push({
				actionId: item[0].toLowerCase().replace(/\s/g, '_') + '_action',
				options: { val: item[3] },
				delay: 0,
			})
		}

		presets[item[3] + '_preset'] = preset
	})

	// Generic Button Presets — actions with custom option objects (tracking speed/sensitivity,
	// fine adjustment of fixed angle position).
	const AF_AXES = ['Pan', 'Tilt', 'Zoom'] as const
	// Hex offset magnitude used by the fine-adjustment nudge presets (signed 16-bit). Forward = +0x0064.
	const FINE_POS = '0064'
	const FINE_NEG = 'FF9C'
	const GENERIC_BUTTON_PRESET_LIST: GenericButtonPresetSpec[] = [
		// Auto Framing Tracking Speed (1-5) per axis
		...AF_AXES.flatMap((axis) =>
			[1, 2, 3, 4, 5].map<GenericButtonPresetSpec>((v) => [
				'Auto Framing - Tracking Speed',
				`${axis} ${v}`,
				`${axis} Speed\\n${v}\\n$(this:trackingSpeed${axis})`,
				`autoframing_tracking_speed_${axis.toLowerCase()}_${v}`,
				[['autoframing_tracking_speed_action', { axis, value: v }]],
			]),
		),
		// Auto Framing Tracking Sensitivity (0-5) per axis
		...AF_AXES.flatMap((axis) =>
			[0, 1, 2, 3, 4, 5].map<GenericButtonPresetSpec>((v) => [
				'Auto Framing - Tracking Sensitivity',
				`${axis} ${v}`,
				`${axis} Sens\\n${v}\\n$(this:trackingSensitivity${axis})`,
				`autoframing_tracking_sensitivity_${axis.toLowerCase()}_${v}`,
				[['autoframing_tracking_sensitivity_action', { axis, value: v }]],
			]),
		),
		// Fine Adjustment of Fixed Angle Position (relative hex nudges, angle #1)
		[
			'Auto Framing - Fixed Angle Fine Adjust',
			'Pan Left',
			'Fine Angle\\nPan Left',
			'fixedangle_fine_pan_left',
			[['fixed_angle_fine_pantilt_action', { val1: '1', val2: FINE_NEG, val3: '0000' }]],
		],
		[
			'Auto Framing - Fixed Angle Fine Adjust',
			'Pan Right',
			'Fine Angle\\nPan Right',
			'fixedangle_fine_pan_right',
			[['fixed_angle_fine_pantilt_action', { val1: '1', val2: FINE_POS, val3: '0000' }]],
		],
		[
			'Auto Framing - Fixed Angle Fine Adjust',
			'Tilt Up',
			'Fine Angle\\nTilt Up',
			'fixedangle_fine_tilt_up',
			[['fixed_angle_fine_pantilt_action', { val1: '1', val2: '0000', val3: FINE_POS }]],
		],
		[
			'Auto Framing - Fixed Angle Fine Adjust',
			'Tilt Down',
			'Fine Angle\\nTilt Down',
			'fixedangle_fine_tilt_down',
			[['fixed_angle_fine_pantilt_action', { val1: '1', val2: '0000', val3: FINE_NEG }]],
		],
		[
			'Auto Framing - Fixed Angle Fine Adjust',
			'Zoom Tele',
			'Fine Angle\\nZoom Tele',
			'fixedangle_fine_zoom_tele',
			[['fixed_angle_fine_zoom_action', { val1: '1', val2: FINE_POS }]],
		],
		[
			'Auto Framing - Fixed Angle Fine Adjust',
			'Zoom Wide',
			'Fine Angle\\nZoom Wide',
			'fixedangle_fine_zoom_wide',
			[['fixed_angle_fine_zoom_action', { val1: '1', val2: FINE_NEG }]],
		],
	]

	GENERIC_BUTTON_PRESET_LIST.forEach((item) => {
		const preset: CompanionPresetDefinition = {
			type: 'button',
			category: resolveCategory(item[0]),
			name: item[1],
			style: {
				text: item[2],
				size: FONT_SIZE,
				show_topbar: false,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: item[4].map(([actionId, options]) => ({ actionId, options, delay: 0 })),
					up: [],
				},
			],
			feedbacks: buildPresetFeedbacks(item[5]),
		}

		presets[item[3] + '_preset'] = preset
	})

	// Rotary Presets
	const ROTARY_PRESET_LIST: RotaryPresetSpec[] = [
		// [category, name, text, key, left[actionId, options], right[actionId, options]]
		[
			'Rotary Presets',
			'Rotary Pan',
			'Pan\\n$(this:panPos)',
			'rotary_pan',
			['ptz_step_action', { target: 'pan', step: -DEFAULT_PTZ_STEP }],
			['ptz_step_action', { target: 'pan', step: DEFAULT_PTZ_STEP }],
		],
		[
			'Rotary Presets',
			'Rotary Tilt',
			'Tilt\\n$(this:tiltPos)',
			'rotary_tilt',
			['ptz_step_action', { target: 'tilt', step: -DEFAULT_PTZ_STEP }],
			['ptz_step_action', { target: 'tilt', step: DEFAULT_PTZ_STEP }],
		],
		[
			'Rotary Presets',
			'Rotary Zoom',
			'Zoom\\n$(this:zoomPos)',
			'rotary_zoom',
			['ptz_step_action', { target: 'zoom', step: -DEFAULT_PTZ_STEP }],
			['ptz_step_action', { target: 'zoom', step: DEFAULT_PTZ_STEP }],
		],
	]

	ROTARY_PRESET_LIST.forEach((item) => {
		const preset: CompanionPresetDefinition = {
			type: 'button',
			category: resolveCategory(item[0]),
			name: item[1],
			options: { rotaryActions: true },
			style: {
				text: item[2],
				size: FONT_SIZE,
				show_topbar: false,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
					rotate_left: [{ actionId: item[4][0], options: item[4][1] }],
					rotate_right: [{ actionId: item[5][0], options: item[5][1] }],
				},
			],
			feedbacks: buildPresetFeedbacks(item[6]),
		}

		presets[item[3] + '_preset'] = preset
	})

	// GenericRotary Presets
	const GENERIC_ROTARY_PRESET_LIST: GenericRotaryPresetSpec[] = [
		// [category, name, text, key, left[actionId, options], right[actionId, options]]
		[
			'Rotary (BRC-AM7)',
			'Gain',
			'Gain\\n$(this:exposureGain)',
			'am7_rotary_gain',
			['generic_step_action', { path: 'command/imaging.cgi', param: 'ExposureGain', step: -1, min: 6, max: 45 }],
			['generic_step_action', { path: 'command/imaging.cgi', param: 'ExposureGain', step: 1, min: 6, max: 45 }],
		],
		[
			'Rotary (BRC-AM7)',
			'Iris',
			'Iris\\n$(this:exposureIris)',
			'am7_rotary_iris',
			[
				'generic_step_action',
				{ path: 'command/imaging.cgi', param: 'ExposureIris', step: -20, min: 30975, max: 32000 },
			],
			['generic_step_action', { path: 'command/imaging.cgi', param: 'ExposureIris', step: 20, min: 30975, max: 32000 }],
		],
		[
			'Rotary (BRC-AM7)',
			'ExposureNDVariable',
			'ND Variable\\n$(this:exposureNDVariable)',
			'am7_rotary_ndvariable',
			['generic_step_action', { path: 'command/imaging.cgi', param: 'ExposureNDVariable', step: -1, min: 0, max: 20 }],
			['generic_step_action', { path: 'command/imaging.cgi', param: 'ExposureNDVariable', step: 1, min: 0, max: 20 }],
		],
		[
			'Rotary (BRC-AM7)',
			'Master Black',
			'Master Black\\n$(this:masterBlack)',
			'am7_rotary_masterblack',
			['generic_step_action', { path: 'command/paint.cgi', param: 'MasterBlack', step: -10, min: -990, max: 990 }],
			['generic_step_action', { path: 'command/paint.cgi', param: 'MasterBlack', step: 10, min: -990, max: 990 }],
		],
		[
			'Rotary (SRG-A12/A40)',
			'Gain',
			'Gain\\n$(this:exposureGain)',
			'srg_rotary_gain',
			['generic_step_action', { path: 'command/imaging.cgi', param: 'ExposureGain', step: -1, min: 1, max: 13 }],
			['generic_step_action', { path: 'command/imaging.cgi', param: 'ExposureGain', step: 1, min: 1, max: 13 }],
		],
		[
			'Rotary (SRG-A12/A40)',
			'Iris',
			'Iris\\n$(this:exposureIris)',
			'srg_rotary_iris',
			['generic_step_action', { path: 'command/imaging.cgi', param: 'ExposureIris', step: -1, min: 0, max: 25 }],
			['generic_step_action', { path: 'command/imaging.cgi', param: 'ExposureIris', step: 1, min: 0, max: 25 }],
		],
	]

	GENERIC_ROTARY_PRESET_LIST.forEach((item) => {
		const preset: CompanionPresetDefinition = {
			type: 'button',
			category: resolveCategory(item[0]),
			name: item[1],
			options: { rotaryActions: true },
			style: {
				text: item[2],
				size: FONT_SIZE,
				show_topbar: false,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
					rotate_left: [{ actionId: item[4][0], options: item[4][1] }],
					rotate_right: [{ actionId: item[5][0], options: item[5][1] }],
				},
			],
			feedbacks: buildPresetFeedbacks(item[6]),
		}

		presets[item[3] + '_preset'] = preset
	})

	self.setPresetDefinitions(presets)
}
