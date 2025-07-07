import type { ModuleInstance } from './main.js'
import { combineRgb, CompanionPresetDefinition, CompanionPresetDefinitions } from '@companion-module/base'
import { DEFAULT_PTZ_MOVE_SPEED, DEFAULT_PTZ_ZOOM_SPEED, SPEED_PARAM_ACTIONS } from './actions.js'

type PresetSpec = [string, string, string, string, [string, string, number][], [string, string, number][]]

const FONT_SIZE = 12
const SPEED_PARAM_ACTION_IDS = SPEED_PARAM_ACTIONS.map((x) => x.toLowerCase().split(' ').join('_') + '_action')

export function UpdatePresets(self: ModuleInstance): void {
	const PRESET_LIST: PresetSpec[] = [
		// [category, name, text, key, down[actionId, choiceId, delay][], up[actionId, choiceId, delay]]
		['System Power', 'On', 'PTZ\\nOn', 'system_on', [], []],
		['System Power', 'Standby', 'PTZ\\nStandby', 'system_standby', [], []],
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
			feedbacks: [],
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

	self.setPresetDefinitions(presets)
}
