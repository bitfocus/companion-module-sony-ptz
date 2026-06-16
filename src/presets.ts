import type { ModuleInstance } from './main.js'
import {
	combineRgb,
	CompanionFeedbackButtonStyleResult,
	CompanionPresetDefinition,
	CompanionPresetDefinitions,
	CompanionPresetFeedback,
} from '@companion-module/base'
import { DEFAULT_PTZ_MOVE_SPEED, DEFAULT_PTZ_ZOOM_SPEED, DEFAULT_PTZ_STEP } from './actions/index.js'

const FONT_SIZE = 12
const MOVE_SPEED = DEFAULT_PTZ_MOVE_SPEED.toString()
const ZOOM_SPEED = DEFAULT_PTZ_ZOOM_SPEED.toString()

// Default highlight applied to a preset feedback when it does not specify its own style.
const DEFAULT_ACTIVE_STYLE: CompanionFeedbackButtonStyleResult = {
	bgcolor: combineRgb(243, 174, 61),
}

// One action inside a step. delay is always 0 here; kept explicit to match the Companion shape.
type Step = { actionId: string; options: Record<string, any>; delay: number }
// A rotary side: the action and its options object.
type RotaryAction = [actionId: string, options: Record<string, any>]

function step(actionId: string, options: Record<string, any>): Step {
	return { actionId, options, delay: 0 }
}

// Standard preset button label: "Group\\nVALUE" with VALUE in all caps.
function presetText(label: string, value: string): string {
	return `${label}\\n${value.toUpperCase()}`
}

interface ButtonSpec {
	category: string
	name: string
	text: string
	key: string
	down: Step[]
	up?: Step[]
	feedbacks?: CompanionPresetFeedback[]
}

interface RotarySpec {
	category: string
	name: string
	text: string
	key: string
	left: RotaryAction
	right: RotaryAction
	feedbacks?: CompanionPresetFeedback[]
}

export function UpdatePresets(self: ModuleInstance): void {
	const presets: CompanionPresetDefinitions = {}

	// Map each authoring category to a broad top-level group plus a sub-section label.
	// Optional third element lists the models a category applies to
	const CATEGORY_MAP: Record<string, [topCategory: string, subLabel: string, models?: string[]]> = {
		'Auto Framing - Controls': ['Auto Framing', 'Controls'],
		'Auto Framing - Mode': ['Auto Framing', 'Framing Mode'],
		'Auto Framing - Shot Mode': ['Auto Framing', 'Shot Mode'],
		'Auto Framing - Lead Room': ['Auto Framing', 'Lead Room'],
		'Auto Framing - Frame/Area Indicator': ['Auto Framing', 'Frame/Area Indicator'],
		'Auto Framing - Fixed Angle Position': ['Auto Framing', 'Fixed Angle Position', ['SRG-A40', 'SRG-A12']],
		'Auto Framing - Fixed Angle Adjustment': ['Auto Framing', 'Fixed Angle Adjustment', ['SRG-A40', 'SRG-A12']],
		'Auto Framing - Multi Tracking': ['Auto Framing', 'Multi Tracking'],
		'Auto Framing - Tracking Speed': ['Auto Framing', 'Tracking Speed', ['BRC-AM7']],
		'Auto Framing - Tracking Sensitivity': ['Auto Framing', 'Tracking Sensitivity', ['BRC-AM7']],
		'Pan/Tilt/Zoom - Pan/Tilt': ['Pan/Tilt/Zoom', 'Pan / Tilt'],
		'Pan/Tilt/Zoom - Zoom': ['Pan/Tilt/Zoom', 'Zoom'],
		'Auto Focus - Focus Mode': ['Focus Controls', 'Focus Mode'],
		'Auto Focus - AF Mode': ['Focus Controls', 'AF Mode'],
		'Auto Focus - Sensitivity': ['Focus Controls', 'Sensitivity'],
		'Imaging - White Balance': ['Imaging', 'White Balance'],
		'Imaging - White Balance Gain': ['Imaging', 'White Balance Gain'],
		'Imaging - Stabilizer': ['Imaging', 'Stabilizer'],
		'Tally - Control': ['Tally', 'Control'],
		'Preset Call': ['PTZ Presets', 'Recall'],
		'Preset Set': ['PTZ Presets', 'Store'],
		'Scene File Recall': ['Scene File Recall', 'Scene File Recall', ['BRC-AM7']],
		'Rotary Presets': ['Rotary', 'Pan / Tilt / Zoom'],
		'Rotary (BRC-AM7)': ['Rotary', 'BRC-AM7', ['BRC-AM7']],
		'Rotary (SRG-A12/A40)': ['Rotary', 'SRG-A12/A40', ['SRG-A40', 'SRG-A12']],
	}

	const KNOWN_MODELS = new Set(['BRC-AM7', 'SRG-A40', 'SRG-A12'])
	const model = String(self.state.get('modelName') ?? '')
		.trim()
		.toUpperCase()
	const filterByModel = KNOWN_MODELS.has(model)

	// Whether a category's presets should be exported for the connected model
	function categoryVisible(authorCategory: string): boolean {
		if (!filterByModel) return true
		const models = CATEGORY_MAP[authorCategory]?.[2]
		return !models || models.some((m) => m.toUpperCase() === model)
	}

	const seenSubHeaders = new Set<string>()
	// Resolve an authoring category to its top-level group
	function resolveCategory(authorCategory: string): string {
		const [top, sub] = CATEGORY_MAP[authorCategory] ?? [authorCategory, authorCategory]
		if (sub !== top && !seenSubHeaders.has(`${top}::${sub}`)) {
			seenSubHeaders.add(`${top}::${sub}`)
			const headerKey = `zz_header_${`${top}_${sub}`.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`
			presets[headerKey] = { type: 'text', category: top, name: sub, text: '' }
		}
		return top
	}

	function feedbacks(list?: CompanionPresetFeedback[]): CompanionPresetFeedback[] {
		return (list ?? []).map((fb) => ({ ...fb, style: fb.style ?? DEFAULT_ACTIVE_STYLE }))
	}

	// Register a normal button preset. Skips it when the category isn't visible for this model.
	function button(spec: ButtonSpec): void {
		if (!categoryVisible(spec.category)) return
		const preset: CompanionPresetDefinition = {
			type: 'button',
			category: resolveCategory(spec.category),
			name: spec.name,
			style: {
				text: spec.text,
				size: FONT_SIZE,
				show_topbar: false,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(32, 32, 32),
			},
			steps: [{ down: spec.down, up: spec.up ?? [] }],
			feedbacks: feedbacks(spec.feedbacks),
		}
		presets[`${spec.key}_preset`] = preset
	}

	// Register a rotary (encoder) preset with left/right turn actions.
	function rotary(spec: RotarySpec): void {
		if (!categoryVisible(spec.category)) return
		const preset: CompanionPresetDefinition = {
			type: 'button',
			category: resolveCategory(spec.category),
			name: spec.name,
			options: { rotaryActions: true },
			style: {
				text: spec.text,
				size: FONT_SIZE,
				show_topbar: false,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(32, 32, 32),
			},
			steps: [
				{
					down: [],
					up: [],
					rotate_left: [{ actionId: spec.left[0], options: spec.left[1] }],
					rotate_right: [{ actionId: spec.right[0], options: spec.right[1] }],
				},
			],
			feedbacks: feedbacks(spec.feedbacks),
		}
		presets[`${spec.key}_preset`] = preset
	}

	// ---- System ----------------------------------------------------------------
	button({
		category: 'System',
		name: 'On',
		text: presetText('PTZ', 'On'),
		key: 'system_on',
		down: [step('system_power_action', { val: 'system_on' })],
		feedbacks: [{ feedbackId: 'power', options: { power: 'on' } }],
	})
	button({
		category: 'System',
		name: 'Standby',
		text: presetText('PTZ', 'Standby'),
		key: 'system_standby',
		down: [step('system_power_action', { val: 'system_standby' })],
		feedbacks: [{ feedbackId: 'power', options: { power: 'standby' } }],
	})

	// ---- Auto Framing: Controls -----------------------------------------------
	button({
		category: 'Auto Framing - Controls',
		name: 'On',
		text: presetText('Auto Framing', 'On'),
		key: 'autoframing_on',
		down: [step('auto_framing_action', { val: 'autoframing_on' })],
		feedbacks: [{ feedbackId: 'autoFraming', options: { state: 'on' } }],
	})
	button({
		category: 'Auto Framing - Controls',
		name: 'Off',
		text: presetText('Auto Framing', 'Off'),
		key: 'autoframing_off',
		down: [step('auto_framing_action', { val: 'autoframing_off' })],
		feedbacks: [{ feedbackId: 'autoFraming', options: { state: 'off' } }],
	})
	button({
		category: 'Auto Framing - Controls',
		name: 'Pause On',
		text: presetText('Auto Framing', 'Pause'),
		key: 'autoframing_pause_on',
		down: [step('auto_framing_action', { val: 'autoframing_pause_on' })],
	})
	button({
		category: 'Auto Framing - Controls',
		name: 'Pause Off',
		text: presetText('Auto Framing', 'Resume'),
		key: 'autoframing_pause_off',
		down: [step('auto_framing_action', { val: 'autoframing_pause_off' })],
	})
	button({
		category: 'Auto Framing - Controls',
		name: 'Restart',
		text: presetText('Auto Framing', 'Restart'),
		key: 'autoframing_restart',
		down: [step('auto_framing_action', { val: 'autoframing_restart' })],
	})
	button({
		category: 'Auto Framing - Controls',
		name: 'Home',
		text: presetText('Auto Framing', 'Home'),
		key: 'autoframing_home',
		down: [step('preset_call_action', { val: 'autoframing_home' })],
	})

	// ---- Auto Framing: Mode (Person / Ball Sports) ----------------------------
	button({
		category: 'Auto Framing - Mode',
		name: 'Person',
		text: presetText('Framing', 'Person'),
		key: 'autoframing_person',
		down: [step('framing_mode_action', { val: 'autoframing_person' })],
		feedbacks: [{ feedbackId: 'framingMode', options: { mode: 'person' } }],
	})
	button({
		category: 'Auto Framing - Mode',
		name: 'Ball Sports',
		text: presetText('Framing', 'Ball Sports'),
		key: 'autoframing_ball',
		down: [step('framing_mode_action', { val: 'autoframing_ball' })],
		feedbacks: [{ feedbackId: 'framingMode', options: { mode: 'ball_sports' } }],
	})

	// ---- Auto Framing: Shot Mode ----------------------------------------------
	const shotModes: [name: string, value: string, key: string, mode: string][] = [
		['Mode:Fullbody', 'Fullbody', 'autoframing_fullbody', '1200'],
		['Mode:Waist', 'Waist', 'autoframing_waist', '510'],
		['Mode:Closeup', 'Closeup', 'autoframing_closeup', '310'],
		['Mode:Closer Closeup', 'Closer Closeup', 'autoframing_closer_closeup', '200'],
	]
	for (const [name, value, key, mode] of shotModes) {
		button({
			category: 'Auto Framing - Shot Mode',
			name,
			text: presetText('AF Mode', value),
			key,
			down: [step('auto_framing_shot_mode_action', { val: key })],
			feedbacks: [{ feedbackId: 'shotMode', options: { mode } }],
		})
	}

	// ---- Auto Framing: Lead Room ----------------------------------------------
	const leadRooms: [name: string, key: string, level: string][] = [
		['Off', 'autoframing_leadroom_off', 'Off'],
		['Low', 'autoframing_leadroom_low', 'Low'],
		['Middle', 'autoframing_leadroom_middle', 'Middle'],
		['High', 'autoframing_leadroom_high', 'High'],
	]
	for (const [name, key, level] of leadRooms) {
		button({
			category: 'Auto Framing - Lead Room',
			name,
			text: presetText('Lead Room', name),
			key,
			down: [step('lead_room_action', { val: key })],
			feedbacks: [{ feedbackId: 'leadRoom', options: { level } }],
		})
	}

	// ---- Auto Framing: Frame/Area Indicator -----------------------------------
	button({
		category: 'Auto Framing - Frame/Area Indicator',
		name: 'On',
		text: presetText('Overlay', 'On'),
		key: 'autoframing_faceindicator_on',
		down: [step('auto_framing_frame_area_indicator_action', { val: 'autoframing_faceindicator_on' })],
		feedbacks: [{ feedbackId: 'autoFramingFrameAreaIndicator', options: { state: 'on' } }],
	})
	button({
		category: 'Auto Framing - Frame/Area Indicator',
		name: 'Off',
		text: presetText('Overlay', 'Off'),
		key: 'autoframing_faceindicator_off',
		down: [step('auto_framing_frame_area_indicator_action', { val: 'autoframing_faceindicator_off' })],
		feedbacks: [{ feedbackId: 'autoFramingFrameAreaIndicator', options: { state: 'off' } }],
	})

	// ---- Auto Framing: Fixed Angle Position (SRG-A40/A12) ----------------------
	// Store/Recall are momentary, so they carry no state feedback.
	button({
		category: 'Auto Framing - Fixed Angle Position',
		name: 'On',
		text: presetText('Fixed Angle', 'On'),
		key: 'fixedangle_on',
		down: [step('fixed_angle_position_action', { val: 'fixedangle_on' })],
		feedbacks: [{ feedbackId: 'fixedAngle', options: { state: 'on' } }],
	})
	button({
		category: 'Auto Framing - Fixed Angle Position',
		name: 'Off',
		text: presetText('Fixed Angle', 'Off'),
		key: 'fixedangle_off',
		down: [step('fixed_angle_position_action', { val: 'fixedangle_off' })],
		feedbacks: [{ feedbackId: 'fixedAngle', options: { state: 'off' } }],
	})
	button({
		category: 'Auto Framing - Fixed Angle Position',
		name: 'Store',
		text: presetText('Fixed Angle', 'Store'),
		key: 'fixedangle_store',
		down: [step('fixed_angle_position_action', { val: 'fixedangle_store' })],
	})
	button({
		category: 'Auto Framing - Fixed Angle Position',
		name: 'Recall',
		text: presetText('Fixed Angle', 'Recall'),
		key: 'fixedangle_recall',
		down: [step('fixed_angle_position_action', { val: 'fixedangle_recall' })],
	})

	// ---- Auto Framing: Fixed Angle fine adjustment (SRG-A40/A12) ---------------
	// Plain decimal nudges; the action converts them to the hex the camera expects.
	const FINE_NUDGE = 100
	const fineAdjusts: [name: string, key: string, target: string, step: number][] = [
		['Pan Left', 'fixedangle_fine_pan_left', 'pan', -FINE_NUDGE],
		['Pan Right', 'fixedangle_fine_pan_right', 'pan', FINE_NUDGE],
		['Tilt Up', 'fixedangle_fine_tilt_up', 'tilt', FINE_NUDGE],
		['Tilt Down', 'fixedangle_fine_tilt_down', 'tilt', -FINE_NUDGE],
		['Zoom Tele', 'fixedangle_fine_zoom_tele', 'zoom', FINE_NUDGE],
		['Zoom Wide', 'fixedangle_fine_zoom_wide', 'zoom', -FINE_NUDGE],
	]
	for (const [name, key, target, stepValue] of fineAdjusts) {
		button({
			category: 'Auto Framing - Fixed Angle Adjustment',
			name,
			text: presetText('Fixed Angle', name),
			key,
			down: [step('fixed_angle_fine_action', { target, step: stepValue })],
		})
	}

	// ---- Pan / Tilt ------------------------------------------------------------
	const moves: [name: string, key: string, choice: string][] = [
		['Up', 'ptz_move_up', 'move_up'],
		['Down', 'ptz_move_down', 'move_down'],
		['Left', 'ptz_move_left', 'move_left'],
		['Right', 'ptz_move_right', 'move_right'],
		['Up Left', 'ptz_move_up_left', 'move_up_left'],
		['Up Right', 'ptz_move_up_right', 'move_up_right'],
		['Down Left', 'ptz_move_down_left', 'move_down_left'],
		['Down Right', 'ptz_move_down_right', 'move_down_right'],
	]
	for (const [name, key, choice] of moves) {
		button({
			category: 'Pan/Tilt/Zoom - Pan/Tilt',
			name,
			text: presetText('Pan/Tilt', name),
			key,
			down: [step('ptz_move_action', { val: choice, speed: MOVE_SPEED })],
			up: [step('ptz_move_stop_action', { val: 'stop_pantilt' })],
		})
	}

	// ---- Zoom ------------------------------------------------------------------
	for (const [name, key, choice] of [
		['Tele', 'ptz_zoom_tele', 'zoom_tele'],
		['Wide', 'ptz_zoom_wide', 'zoom_wide'],
	] as const) {
		button({
			category: 'Pan/Tilt/Zoom - Zoom',
			name,
			text: presetText('Zoom', name),
			key,
			down: [step('ptz_zoom_action', { val: choice, speed: ZOOM_SPEED })],
			up: [step('ptz_move_stop_action', { val: 'stop_zoom' })],
		})
	}

	// ---- Preset Call -----------------------------------------------------------
	button({
		category: 'Preset Call',
		name: 'Look Back',
		text: presetText('PTZ Preset', 'Back'),
		key: 'preset_back',
		down: [step('preset_call_action', { val: 'preset_back' })],
	})
	button({
		category: 'Preset Call',
		name: 'PTZ Home',
		text: presetText('PTZ Preset', 'Home'),
		key: 'preset_home',
		down: [step('preset_call_action', { val: 'preset_home' })],
	})
	for (let n = 1; n <= 10; n++) {
		button({
			category: 'Preset Call',
			name: `${n}`,
			text: presetText('PTZ Preset', `${n}`),
			key: `preset_${n}`,
			down: [step('preset_call_action', { val: `preset_${n}` })],
		})
	}

	// ---- Preset Set ------------------------------------------------------------
	for (let n = 1; n <= 10; n++) {
		button({
			category: 'Preset Set',
			name: `${n}`,
			text: presetText('PTZ Preset', `Set ${n}`),
			key: `preset_set_${n}`,
			down: [step('preset_set_action', { val: `preset_set_${n}` })],
		})
	}

	// ---- Focus: Focus Mode -----------------------------------------------------
	button({
		category: 'Auto Focus - Focus Mode',
		name: 'ON',
		text: presetText('Auto Focus', 'On'),
		key: 'auto_focus_auto',
		down: [step('focus_mode_action', { val: 'focus_auto' })],
		feedbacks: [{ feedbackId: 'focusMode', options: { mode: 'auto' } }],
	})
	button({
		category: 'Auto Focus - Focus Mode',
		name: 'OFF',
		text: presetText('Auto Focus', 'Off'),
		key: 'auto_focus_manual',
		down: [step('focus_mode_action', { val: 'focus_manual' })],
		feedbacks: [{ feedbackId: 'focusMode', options: { mode: 'manual' } }],
	})

	// ---- Focus: AF Mode --------------------------------------------------------
	const afModes: [name: string, value: string, key: string, mode: string][] = [
		['Normal Mode', 'Normal', 'afmode_normal', 'normal'],
		['Interval Mode', 'Interval', 'afmode_interval', 'interval'],
		['Zoom Trigger Mode', 'Zoom Trigger', 'afmode_zoomtrigger', 'zoomtrigger'],
	]
	for (const [name, value, key, mode] of afModes) {
		button({
			category: 'Auto Focus - AF Mode',
			name,
			text: presetText('AF Mode', value),
			key,
			down: [step('auto_focus_mode_action', { val: key })],
			feedbacks: [{ feedbackId: 'afMode', options: { mode } }],
		})
	}

	// ---- Focus: Sensitivity ----------------------------------------------------
	const afSensitivities: [name: string, value: string, key: string, level: string][] = [
		['Normal Sensitivity', 'Normal', 'afsensitivity_normal', 'normal'],
		['Low Sensitivity', 'Low', 'afsensitivity_low', 'low'],
	]
	for (const [name, value, key, level] of afSensitivities) {
		button({
			category: 'Auto Focus - Sensitivity',
			name,
			text: presetText('AF Sens', value),
			key,
			down: [step('auto_focus_sensitivity_action', { val: key })],
			feedbacks: [{ feedbackId: 'focusSensitivity', options: { level } }],
		})
	}

	// ---- Imaging: White Balance Mode ------------------------------------------
	const wbModes: [name: string, value: string, key: string, mode: string][] = [
		['Auto', 'Auto', 'whitebalancemode_auto', 'auto'],
		['Indoor', 'Indoor', 'whitebalancemode_indoor', 'indoor'],
		['Outdoor', 'Outdoor', 'whitebalancemode_outdoor', 'outdoor'],
		['One Push WB', 'One Push', 'whitebalancemode_onepushwb', 'onepushwb'],
		['ATW', 'ATW', 'whitebalancemode_atw', 'atw'],
		['Manual', 'Manual', 'whitebalancemode_manual', 'manual'],
	]
	for (const [name, value, key, mode] of wbModes) {
		button({
			category: 'Imaging - White Balance',
			name,
			text: presetText('White Balance', value),
			key,
			down: [step('white_balance_mode_action', { val: `wb_${mode}` })],
			feedbacks: [{ feedbackId: 'whiteBalanceMode', options: { mode } }],
		})
	}

	// ---- Imaging: White Balance Gain (Blue/Red readout + rotary nudge) --------
	const wbGain = (param: string, step: number): RotaryAction => [
		'generic_step_action',
		{ path: 'command/imaging.cgi', param, step, min: 0, max: 255 },
	]
	button({
		category: 'Imaging - White Balance Gain',
		name: 'Blue (Cb) Gain Current',
		text: 'White Balance\\nBlue Gain\\n$(this:whiteBalanceCbGain)',
		key: 'whitebalance_cbgain_current',
		down: [],
	})
	rotary({
		category: 'Imaging - White Balance Gain',
		name: 'Blue (Cb) Gain',
		text: 'WB Blue Gain\\n$(this:whiteBalanceCbGain)',
		key: 'whitebalance_cbgain_rotary',
		left: wbGain('WhiteBalanceCbGain', -1),
		right: wbGain('WhiteBalanceCbGain', 1),
	})
	button({
		category: 'Imaging - White Balance Gain',
		name: 'Red (Cr) Gain Current',
		text: 'White Balance\\nRed Gain\\n$(this:whiteBalanceCrGain)',
		key: 'whitebalance_crgain_current',
		down: [],
	})
	rotary({
		category: 'Imaging - White Balance Gain',
		name: 'Red (Cr) Gain',
		text: 'WB Red Gain\\n$(this:whiteBalanceCrGain)',
		key: 'whitebalance_crgain_rotary',
		left: wbGain('WhiteBalanceCrGain', -1),
		right: wbGain('WhiteBalanceCrGain', 1),
	})

	// ---- Imaging: Image Stabilizer --------------------------------------------
	button({
		category: 'Imaging - Stabilizer',
		name: 'On',
		text: presetText('Stabilizer', 'On'),
		key: 'stabilizer_on',
		down: [step('image_stabilizer_action', { val: 'stabilizer_on' })],
		feedbacks: [{ feedbackId: 'stabilizer', options: { state: 'on' } }],
	})
	button({
		category: 'Imaging - Stabilizer',
		name: 'Off',
		text: presetText('Stabilizer', 'Off'),
		key: 'stabilizer_off',
		down: [step('image_stabilizer_action', { val: 'stabilizer_off' })],
		feedbacks: [{ feedbackId: 'stabilizer', options: { state: 'off' } }],
	})

	// ---- Tally: Control + Red Tally indicator ---------------------------------
	button({
		category: 'Tally - Control',
		name: 'On',
		text: presetText('Tally', 'On'),
		key: 'tallycontrol_on',
		down: [step('tally_control_action', { val: 'tally_on' })],
		feedbacks: [{ feedbackId: 'tallyControl', options: { state: 'on' } }],
	})
	button({
		category: 'Tally - Control',
		name: 'Off',
		text: presetText('Tally', 'Off'),
		key: 'tallycontrol_off',
		down: [step('tally_control_action', { val: 'tally_off' })],
		feedbacks: [{ feedbackId: 'tallyControl', options: { state: 'off' } }],
	})
	// Read-only red/program tally indicator (no action).
	button({
		category: 'Tally - Control',
		name: 'Red Tally Status',
		text: presetText('Tally', 'Red'),
		key: 'tally_red_status',
		down: [],
		feedbacks: [{ feedbackId: 'rTallyStatus', options: { state: 'on' }, style: { bgcolor: combineRgb(255, 0, 0) } }],
	})

	// ---- Auto Framing: Multi Tracking -----------------------------------------
	button({
		category: 'Auto Framing - Multi Tracking',
		name: 'OFF',
		text: presetText('Multi Tracking', 'Off'),
		key: 'multitrackingnum_1',
		down: [step('multi_tracking_num_action', { val: 'multitrackingnum_1' })],
		feedbacks: [{ feedbackId: 'multiTracking', options: { num: '1' } }],
	})
	for (let n = 2; n <= 8; n++) {
		button({
			category: 'Auto Framing - Multi Tracking',
			name: `${n}`,
			text: presetText('Multi Tracking', `${n}`),
			key: `multitrackingnum_${n}`,
			down: [step('multi_tracking_num_action', { val: `multitrackingnum_${n}` })],
			feedbacks: [{ feedbackId: 'multiTracking', options: { num: `${n}` } }],
		})
	}

	// ---- Scene File Recall (BRC-AM7) -------------------------------------------
	for (let n = 1; n <= 16; n++) {
		button({
			category: 'Scene File Recall',
			name: `${n}`,
			text: `Scene File\\n$(this:sceneFileName${n})`,
			key: `scenefile_set_${n}`,
			down: [step('scene_file_recall_action', { val: `scenefile_set_${n}` })],
			feedbacks: [{ feedbackId: 'sceneFile', options: { file: `${n}` } }],
		})
	}

	// ---- Auto Framing: Tracking Speed / Sensitivity (BRC-AM7) ------------------
	// Per axis: a current-value readout, two ±1 adjust buttons, then SET buttons for each value.
	const AF_AXES = ['Pan', 'Tilt', 'Zoom'] as const
	for (const axis of AF_AXES) {
		const lower = axis.toLowerCase()
		button({
			category: 'Auto Framing - Tracking Speed',
			name: `${axis} Current`,
			text: `Auto Framing\\n${axis} Speed\\n$(this:trackingSpeed${axis})`,
			key: `autoframing_tracking_speed_${lower}_current`,
			down: [],
		})
		button({
			category: 'Auto Framing - Tracking Speed',
			name: `${axis} Adjust -1`,
			text: `Auto Framing\\n${axis} Speed\\nADJUST -1`,
			key: `autoframing_tracking_speed_${lower}_adjust_down`,
			down: [step('autoframing_tracking_step_action', { kind: 'Speed', axis, step: -1 })],
		})
		button({
			category: 'Auto Framing - Tracking Speed',
			name: `${axis} Adjust +1`,
			text: `Auto Framing\\n${axis} Speed\\nADJUST +1`,
			key: `autoframing_tracking_speed_${lower}_adjust_up`,
			down: [step('autoframing_tracking_step_action', { kind: 'Speed', axis, step: 1 })],
		})
		for (const v of [1, 2, 3, 4, 5]) {
			button({
				category: 'Auto Framing - Tracking Speed',
				name: `${axis} Set ${v}`,
				text: `Auto Framing\\n${axis} Speed\\nSET ${v}`,
				key: `autoframing_tracking_speed_${lower}_${v}`,
				down: [step('autoframing_tracking_speed_action', { axis, value: v })],
				feedbacks: [{ feedbackId: 'trackingSpeed', options: { axis, value: v } }],
			})
		}
	}
	for (const axis of AF_AXES) {
		const lower = axis.toLowerCase()
		button({
			category: 'Auto Framing - Tracking Sensitivity',
			name: `${axis} Current`,
			text: `Auto Framing\\n${axis} Sens\\n$(this:trackingSensitivity${axis})`,
			key: `autoframing_tracking_sensitivity_${lower}_current`,
			down: [],
		})
		button({
			category: 'Auto Framing - Tracking Sensitivity',
			name: `${axis} Adjust -1`,
			text: `Auto Framing\\n${axis} Sens\\nADJUST -1`,
			key: `autoframing_tracking_sensitivity_${lower}_adjust_down`,
			down: [step('autoframing_tracking_step_action', { kind: 'Sensitivity', axis, step: -1 })],
		})
		button({
			category: 'Auto Framing - Tracking Sensitivity',
			name: `${axis} Adjust +1`,
			text: `Auto Framing\\n${axis} Sens\\nADJUST +1`,
			key: `autoframing_tracking_sensitivity_${lower}_adjust_up`,
			down: [step('autoframing_tracking_step_action', { kind: 'Sensitivity', axis, step: 1 })],
		})
		for (const v of [0, 1, 2, 3, 4, 5]) {
			button({
				category: 'Auto Framing - Tracking Sensitivity',
				name: `${axis} Set ${v}`,
				text: `Auto Framing\\n${axis} Sens\\nSET ${v}`,
				key: `autoframing_tracking_sensitivity_${lower}_${v}`,
				down: [step('autoframing_tracking_sensitivity_action', { axis, value: v })],
				feedbacks: [{ feedbackId: 'trackingSensitivity', options: { axis, value: v } }],
			})
		}
	}

	// ---- Rotary (Pan / Tilt / Zoom) -------------------------------------------
	const rotarySteps: [name: string, key: string, target: string, variable: string][] = [
		['Rotary Pan', 'rotary_pan', 'pan', 'panPos'],
		['Rotary Tilt', 'rotary_tilt', 'tilt', 'tiltPos'],
		['Rotary Zoom', 'rotary_zoom', 'zoom', 'zoomPos'],
	]
	for (const [name, key, target, variable] of rotarySteps) {
		rotary({
			category: 'Rotary Presets',
			name,
			text: `${target.charAt(0).toUpperCase() + target.slice(1)}\\n$(this:${variable})`,
			key,
			left: ['ptz_step_action', { target, step: -DEFAULT_PTZ_STEP }],
			right: ['ptz_step_action', { target, step: DEFAULT_PTZ_STEP }],
		})
	}

	// ---- Rotary: exposure (BRC-AM7) -------------------------------------------
	const imaging = (param: string, step: number, min: number, max: number): RotaryAction => [
		'generic_step_action',
		{ path: 'command/imaging.cgi', param, step, min, max },
	]
	const paint = (param: string, step: number, min: number, max: number): RotaryAction => [
		'generic_step_action',
		{ path: 'command/paint.cgi', param, step, min, max },
	]
	rotary({
		category: 'Rotary (BRC-AM7)',
		name: 'Gain',
		text: 'Gain\\n$(this:exposureGain)',
		key: 'am7_rotary_gain',
		left: imaging('ExposureGain', -1, 6, 45),
		right: imaging('ExposureGain', 1, 6, 45),
	})
	rotary({
		category: 'Rotary (BRC-AM7)',
		name: 'Iris',
		text: 'Iris\\n$(this:exposureIris)',
		key: 'am7_rotary_iris',
		left: imaging('ExposureIris', -20, 30975, 32000),
		right: imaging('ExposureIris', 20, 30975, 32000),
	})
	rotary({
		category: 'Rotary (BRC-AM7)',
		name: 'ExposureNDVariable',
		text: 'ND Variable\\n$(this:exposureNDVariable)',
		key: 'am7_rotary_ndvariable',
		left: imaging('ExposureNDVariable', -1, 0, 20),
		right: imaging('ExposureNDVariable', 1, 0, 20),
	})
	rotary({
		category: 'Rotary (BRC-AM7)',
		name: 'Master Black',
		text: 'Master Black\\n$(this:masterBlack)',
		key: 'am7_rotary_masterblack',
		left: paint('MasterBlack', -10, -990, 990),
		right: paint('MasterBlack', 10, -990, 990),
	})

	// ---- Rotary: exposure (SRG-A12/A40) ---------------------------------------
	rotary({
		category: 'Rotary (SRG-A12/A40)',
		name: 'Gain',
		text: 'Gain\\n$(this:exposureGain)',
		key: 'srg_rotary_gain',
		left: imaging('ExposureGain', -1, 1, 13),
		right: imaging('ExposureGain', 1, 1, 13),
	})
	rotary({
		category: 'Rotary (SRG-A12/A40)',
		name: 'Iris',
		text: 'Iris\\n$(this:exposureIris)',
		key: 'srg_rotary_iris',
		left: imaging('ExposureIris', -1, 0, 25),
		right: imaging('ExposureIris', 1, 0, 25),
	})

	self.setPresetDefinitions(presets)
}
