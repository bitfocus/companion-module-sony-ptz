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
		['System Power', 'On', 'PTZ\\nOn', 'system_on', [], [], [{ feedbackId: 'power', options: { power: 'on' } }]],
		[
			'System Power',
			'Standby',
			'PTZ\\nStandby',
			'system_standby',
			[],
			[],
			[{ feedbackId: 'power', options: { power: 'standby' } }],
		],
		['Auto Framing', 'On', 'Auto Framing\\nOn', 'autoframing_on', [], []],
		['Auto Framing', 'Off', 'Auto Framing\\nOff', 'autoframing_off', [], []],
		['Auto Framing', 'Pause On', 'Auto Framing\\nPause On', 'autoframing_pause_on', [], []],
		['Auto Framing', 'Pause Off', 'Auto Framing\\nPause Off', 'autoframing_pause_off', [], []],
		['Auto Framing', 'Restart', 'Auto Framing\\nRestart', 'autoframing_restart', [], []],
		[
			'Auto Framing',
			'Home',
			'Auto Framing\\nHome',
			'autoframing_home',
			[['preset_call_action', 'autoframing_home', 0]],
			[],
		],
		[
			'Auto Framing',
			'Mode:Closer Closeup',
			'AF Mode\\nCloser',
			'autoframing_closer_closeup',
			[['auto_framing_shot_mode_action', 'autoframing_closer_closeup', 0]],
			[],
		],
		[
			'Auto Framing',
			'Mode:Closeup',
			'AF Mode\\nCloseup',
			'autoframing_closeup',
			[['auto_framing_shot_mode_action', 'autoframing_closeup', 0]],
			[],
		],
		[
			'Auto Framing',
			'Mode:Waist',
			'AF Mode\\nWaist',
			'autoframing_waist',
			[['auto_framing_shot_mode_action', 'autoframing_waist', 0]],
			[],
		],
		[
			'Auto Framing',
			'Mode:Fullbody',
			'AF Mode\\nFullbody',
			'autoframing_fullbody',
			[['auto_framing_shot_mode_action', 'autoframing_fullbody', 0]],
			[],
		],
		// Person/Ball Sports Framing switching (Framing Mode action)

		[
			'Framing Mode',
			'Person',
			'Framing\\nPerson',
			'autoframing_person',
			[],
			[],
			[{ feedbackId: 'framingMode', options: { mode: 'person' } }],
		],

		[
			'Framing Mode',
			'Ball Sports',
			'Framing\\nBall',
			'autoframing_ball',
			[],
			[],
			[{ feedbackId: 'framingMode', options: { mode: 'ball_sports' } }],
		],
		// Lead Room Effect

		[
			'Lead Room Effect',
			'Off',
			'Lead Room\\nOff',
			'autoframing_leadroom_off',
			[],
			[],
			[{ feedbackId: 'leadRoom', options: { level: 'off' } }],
		],

		[
			'Lead Room Effect',
			'Low',
			'Lead Room\\nLow',
			'autoframing_leadroom_low',
			[],
			[],
			[{ feedbackId: 'leadRoom', options: { level: 'low' } }],
		],

		[
			'Lead Room Effect',
			'Middle',
			'Lead Room\\nMiddle',
			'autoframing_leadroom_middle',
			[],
			[],
			[{ feedbackId: 'leadRoom', options: { level: 'middle' } }],
		],

		[
			'Lead Room Effect',
			'High',
			'Lead Room\\nHigh',
			'autoframing_leadroom_high',
			[],
			[],
			[{ feedbackId: 'leadRoom', options: { level: 'high' } }],
		],
		// Real-time Overlay (Frame/Area Indicator)

		[
			'Real-time Overlay',
			'On',
			'Overlay\\nOn',
			'autoframing_faceindicator_on',
			[],
			[],
			[{ feedbackId: 'realtimeOverlay', options: { state: 'on' } }],
		],

		[
			'Real-time Overlay',
			'Off',
			'Overlay\\nOff',
			'autoframing_faceindicator_off',
			[],
			[],
			[{ feedbackId: 'realtimeOverlay', options: { state: 'off' } }],
		],
		// Fixed Angle Position (SRG-A40/A12) — Store/Recall are momentary, no state feedback

		[
			'Fixed Angle Position',
			'Off',
			'Fixed Angle\\nOff',
			'fixedangle_off',
			[],
			[],
			[{ feedbackId: 'fixedAngle', options: { state: 'off' } }],
		],

		[
			'Fixed Angle Position',
			'On',
			'Fixed Angle\\nOn',
			'fixedangle_on',
			[],
			[],
			[{ feedbackId: 'fixedAngle', options: { state: 'on' } }],
		],
		['Fixed Angle Position', 'Store', 'Fixed Angle\\nStore', 'fixedangle_store', [], []],
		['Fixed Angle Position', 'Recall', 'Fixed Angle\\nRecall', 'fixedangle_recall', [], []],
		[
			'Pan/Tilt/Zoom',
			'Up',
			'Tilt Up',
			'ptz_move_up',
			[['ptz_move_action', 'move_up', 0]],
			[['ptz_move_stop_action', 'stop_pantilt', 0]],
		],
		[
			'Pan/Tilt/Zoom',
			'Down',
			'Tilt Down',
			'ptz_move_down',
			[['ptz_move_action', 'move_down', 0]],
			[['ptz_move_stop_action', 'stop_pantilt', 0]],
		],
		[
			'Pan/Tilt/Zoom',
			'Left',
			'Pan Left',
			'ptz_move_left',
			[['ptz_move_action', 'move_left', 0]],
			[['ptz_move_stop_action', 'stop_pantilt', 0]],
		],
		[
			'Pan/Tilt/Zoom',
			'Right',
			'Pan Right',
			'ptz_move_right',
			[['ptz_move_action', 'move_right', 0]],
			[['ptz_move_stop_action', 'stop_pantilt', 0]],
		],
		[
			'Pan/Tilt/Zoom',
			'Up Left',
			'Tilt Up Left',
			'ptz_move_up_left',
			[['ptz_move_action', 'move_up_left', 0]],
			[['ptz_move_stop_action', 'stop_pantilt', 0]],
		],
		[
			'Pan/Tilt/Zoom',
			'Up Right',
			'Tilt Up Right',
			'ptz_move_up_right',
			[['ptz_move_action', 'move_up_right', 0]],
			[['ptz_move_stop_action', 'stop_pantilt', 0]],
		],
		[
			'Pan/Tilt/Zoom',
			'Down Left',
			'Tilt Down Left',
			'ptz_move_down_left',
			[['ptz_move_action', 'move_down_left', 0]],
			[['ptz_move_stop_action', 'stop_pantilt', 0]],
		],
		[
			'Pan/Tilt/Zoom',
			'Down Right',
			'Tilt Down Right',
			'ptz_move_down_right',
			[['ptz_move_action', 'move_down_right', 0]],
			[['ptz_move_stop_action', 'stop_pantilt', 0]],
		],
		[
			'Pan/Tilt/Zoom',
			'Tele',
			'Zoom Tele',
			'ptz_zoom_tele',
			[['ptz_zoom_action', 'zoom_tele', 0]],
			[['ptz_move_stop_action', 'stop_zoom', 0]],
		],
		[
			'Pan/Tilt/Zoom',
			'Wide',
			'Zoom Wide',
			'ptz_zoom_wide',
			[['ptz_zoom_action', 'zoom_wide', 0]],
			[['ptz_move_stop_action', 'stop_zoom', 0]],
		],
		['Preset Call', 'Look Back', 'PTZ Preset\\nBack', 'preset_back', [], []],
		['Preset Call', 'PTZ Home', 'PTZ Preset\\nHome', 'preset_home', [], []],
		['Auto Focus', 'ON', 'Auto Focus\\nON (auto)', 'auto_focus_auto', [['focus_mode_action', 'focus_auto', 0]], []],
		[
			'Auto Focus',
			'OFF',
			'Auto Focus\\nOFF (manual)',
			'auto_focus_manual',
			[['focus_mode_action', 'focus_manual', 0]],
			[],
		],
		[
			'Auto Focus',
			'Normal Mode',
			'Auto Focus\\nNormal Mode',
			'afmode_normal',
			[['auto_focus_mode_action', 'afmode_normal', 0]],
			[],
		],
		[
			'Auto Focus',
			'Interval Mode',
			'Auto Focus\\nInterval Mode',
			'afmode_interval',
			[['auto_focus_mode_action', 'afmode_interval', 0]],
			[],
		],
		[
			'Auto Focus',
			'Zoom Trigger Mode',
			'Auto Focus\\nZoom Trigger',
			'afmode_zoomtrigger',
			[['auto_focus_mode_action', 'afmode_zoomtrigger', 0]],
			[],
		],
		[
			'Auto Focus',
			'Normal Sensitivity',
			'Auto Focus\\nNormal Sensitivity',
			'afsensitivity_normal',
			[['auto_focus_sensitivity_action', 'afsensitivity_normal', 0]],
			[],
		],
		[
			'Auto Focus',
			'Low Sensitivity',
			'Auto Focus\\nLow Sensitivity',
			'afsensitivity_low',
			[['auto_focus_sensitivity_action', 'afsensitivity_low', 0]],
			[],
		],
		['Multi Tracking Num', 'OFF', 'Multi Tracking OFF', 'multitrackingnum_1', [], []],
		// @ts-expect-error  The first param 'x' will not be used
		...[...Array(7)].map((x, i) => [
			'Multi Tracking Num',
			`${i + 2}`,
			`Multi Tracking Num=${i + 2}`,
			`multitrackingnum_${i + 2}`,
			[],
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

	// 0:category, 1:name, 2:text, 3:key, 4:[actionId, choiceId, delay][]
	PRESET_LIST.forEach((item) => {
		const downSteps = item[4]
		const upSteps = item[5]

		const preset: CompanionPresetDefinition = {
			type: 'button',
			category: item[0],
			name: item[1],
			style: {
				text: item[2],
				size: FONT_SIZE,
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
					? { val: step[1], speed: step[0] === 'ptz_move_action' ? DEFAULT_PTZ_MOVE_SPEED : DEFAULT_PTZ_ZOOM_SPEED }
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
			category: item[0],
			name: item[1],
			options: { rotaryActions: true },
			style: {
				text: item[2],
				size: FONT_SIZE,
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
			category: item[0],
			name: item[1],
			options: { rotaryActions: true },
			style: {
				text: item[2],
				size: FONT_SIZE,
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
