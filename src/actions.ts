import type {
	CompanionActionDefinition,
	CompanionActionDefinitions,
	CompanionActionEvent,
	CompanionInputFieldDropdown,
} from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { PtzCommandParams } from './sonyptz.js'

export const DEFAULT_PTZ_MOVE_SPEED = 8
export const DEFAULT_PTZ_ZOOM_SPEED = 8000
export const DEFAULT_PTZ_STEP = 5
export const SPEED_PARAM_ACTIONS = ['PTZ Move', 'PTZ Zoom']

export type CommandSpec = [string, string, string, string, PtzCommandParams, boolean]

function clamp(self: ModuleInstance, value: number, min: string, max: string): number {
	const _min = self.getVariableValue(min)
	const _max = self.getVariableValue(max)
	return Math.min(Math.max(value, _min === '' ? -0xffff : (_min as number)), _max === '' ? 0xffff : (_max as number))
}

function to16(num: number): string {
	const buffer = new ArrayBuffer(2)
	const int16Array = new Int16Array(buffer)
	int16Array[0] = num
	const signed16BitValue = int16Array[0]
	const unsigned16BitValue = signed16BitValue & 0xffff
	const hexString = unsigned16BitValue.toString(16)
	return hexString.padStart(4, '0')
}

export function UpdateActions(self: ModuleInstance): void {
	const COMMAND_LIST: CommandSpec[] = [
		// [actionId, choiceLabel, choiceId, commandPath, commandParams, isDefault]
		['System Power', 'ON', 'system_on', 'command/main.cgi', { System: 'on' }, true],
		['System Power', 'Standby', 'system_standby', 'command/main.cgi', { System: 'standby' }, false],
		['Auto Framing', 'ON', 'autoframing_on', 'analytics/ptzautoframing.cgi', { PtzAutoFraming: 'on' }, false],
		['Auto Framing', 'OFF', 'autoframing_off', 'analytics/ptzautoframing.cgi', { PtzAutoFraming: 'off' }, true],
		[
			'Auto Framing',
			'Pause ON',
			'autoframing_pause_on',
			'analytics/ptzautoframing.cgi',
			{ PtzAutoFramingPause: 'on' },
			false,
		],
		[
			'Auto Framing',
			'Pause OFF',
			'autoframing_pause_off',
			'analytics/ptzautoframing.cgi',
			{ PtzAutoFramingPause: 'off' },
			false,
		],
		[
			'Auto Framing',
			'Restart',
			'autoframing_restart',
			'analytics/ptzautoframingexe.cgi',
			{ PtzAutoFramingRestart: 'on' },
			false,
		],
		['PTZ Reset', 'Reset', 'ptzf_reset', 'command/ptzf.cgi', { PanTiltReset: 'on' }, true],
		['Preset Call', 'Look Back', 'preset_back', 'command/ptzf.cgi', { AbsolutePanTilt: '2200,0,24' }, false],
		['Preset Call', 'PTZ Home', 'preset_home', 'command/presetposition.cgi', { HomePos: 'recall' }, false],
		[
			'Preset Call',
			'Auto Framing Start Position',
			'autoframing_home',
			'analytics/ptzautoframingexe.cgi',
			{ PtzAutoFramingMoveStartPosition: 'on' },
			false,
		],
		[
			'Auto Framing Shot Mode',
			'Closeup',
			'autoframing_closeup',
			'analytics/ptzautoframing.cgi',
			{ PtzAutoFramingAdjustSetting: '0,0,310' },
			false,
		],
		[
			'Auto Framing Shot Mode',
			'Waist',
			'autoframing_waist',
			'analytics/ptzautoframing.cgi',
			{ PtzAutoFramingAdjustSetting: '0,0,510' },
			false,
		],
		[
			'Auto Framing Shot Mode',
			'Full Body',
			'autoframing_fullbody',
			'analytics/ptzautoframing.cgi',
			{ PtzAutoFramingAdjustSetting: '0,0,1200' },
			true,
		],
		[
			'Auto Framing Start Position',
			'Decide',
			'autoframing_startpos_set',
			'analytics/ptzautoframingexe.cgi',
			{ PtzAutoFramingDecideStartPosition: 'on' },
			true,
		],
		[
			'Auto Framing Start Position',
			'Move',
			'autoframing_startpos_move',
			'analytics/ptzautoframingexe.cgi',
			{ PtzAutoFramingMoveStartPosition: 'on' },
			true,
		],
		['PTZ Move', 'Up', 'move_up', 'command/ptzf.cgi', { PanTiltMove: 'up,0,{speed}' }, true],
		['PTZ Move', 'Down', 'move_down', 'command/ptzf.cgi', { PanTiltMove: 'down,0,{speed}' }, false],
		['PTZ Move', 'Left', 'move_left', 'command/ptzf.cgi', { PanTiltMove: 'left,{speed},0' }, false],
		['PTZ Move', 'Right', 'move_right', 'command/ptzf.cgi', { PanTiltMove: 'right,{speed},0' }, false],
		['PTZ Move', 'Up Left', 'move_up_left', 'command/ptzf.cgi', { PanTiltMove: 'up-left,{speed},{speed}' }, false],
		['PTZ Move', 'Up Right', 'move_up_right', 'command/ptzf.cgi', { PanTiltMove: 'up-right,{speed},{speed}' }, false],
		[
			'PTZ Move',
			'Down Left',
			'move_down_left',
			'command/ptzf.cgi',
			{ PanTiltMove: 'down-left,{speed},{speed}' },
			false,
		],
		[
			'PTZ Move',
			'Down Right',
			'move_down_right',
			'command/ptzf.cgi',
			{ PanTiltMove: 'down-right,{speed},{speed}' },
			false,
		],
		['PTZ Zoom', 'Tele', 'zoom_tele', 'command/ptzf.cgi', { ZoomMove: 'tele,{speed}' }, true],
		['PTZ Zoom', 'Wide', 'zoom_wide', 'command/ptzf.cgi', { ZoomMove: 'wide,{speed}' }, false],
		['PTZ Move Stop', 'Pan/Tilt', 'stop_pantilt', 'command/ptzf.cgi', { PanTiltMove: 'stop,0,0' }, true],
		['PTZ Move Stop', 'Tele/Wide', 'stop_zoom', 'command/ptzf.cgi', { ZoomMove: 'stop,0' }, false],
		['PTZ Move Stop', 'Focus', 'stop_focus', 'command/ptzf.cgi', { Move: 'stop,focus' }, false],
		['PTZ Move Stop', 'Motor', 'stop_motor', 'command/ptzf.cgi', { Move: 'stop,motor' }, false],
		[
			'Multi Tracking Num',
			'1',
			'multitrackingnum_1',
			'analytics/ptzautoframing.cgi',
			{ PtzAutoFramingMultiTrackingEnable: 'off' },
			true,
		],
		['Auto Focus Mode', 'Normal', 'afmode_normal', 'command/imaging.cgi', { AFMode: 'normal' }, true],
		['Auto Focus Mode', 'Interval', 'afmode_interval', 'command/imaging.cgi', { AFMode: 'interval' }, false],
		['Auto Focus Mode', 'Zoom Trigger', 'afmode_zoomtrigger', 'command/imaging.cgi', { AFMode: 'zoomtrigger' }, false],
		[
			'Auto Focus Sensitivity',
			'Normal',
			'afsensitivity_normal',
			'command/imaging.cgi',
			{ AFSensitivity: 'normal' },
			true,
		],
		['Auto Focus Sensitivity', 'Low', 'afsensitivity_low', 'command/imaging.cgi', { AFSensitivity: 'low' }, false],
		['Focus Mode', 'Auto', 'focus_auto', 'command/imaging.cgi', { FocusMode: 'auto' }, true],
		['Focus Mode', 'Manual', 'focus_manual', 'command/imaging.cgi', { FocusMode: 'manual' }, false],
		// @ts-expect-error  The first param will not be used
		...[...Array(7)].map((x, i) => [
			'Multi Tracking Num',
			(i + 2).toString(),
			'multitrackingnum_' + (i + 2),
			'analytics/ptzautoframing.cgi',
			{ PtzAutoFramingMultiTrackingEnable: 'on', PtzAutoFramingMultiTrackingTargetNum: (i + 2).toString() },
			false,
		]),
		// @ts-expect-error  The first param will not be used
		...[...Array(61)].map((x, i) => [
			'Multi Tracking Wait Time',
			i.toString(),
			'waittime_' + i,
			'analytics/ptzautoframing.cgi',
			{ PtzAutoFramingMultiTrackingWaitTime: i },
			i ? false : true,
		]),
		// @ts-expect-error  The first param will not be used
		...[...Array(10)].map((x, i) => [
			'Preset Call',
			(i + 1).toString(),
			'preset_' + (i + 1),
			'command/presetposition.cgi',
			{ PresetCall: (i + 1).toString() },
			i ? false : true,
		]),
		// @ts-expect-error  The first param will not be used
		...[...Array(10)].map((x, i) => [
			'Preset Set',
			(i + 1).toString(),
			`preset_set_${i + 1}`,
			'command/presetposition.cgi',
			{ PresetSet: `${i + 1},Preset${i + 1},on` },
			i ? false : true,
		]),
	]

	interface Commands {
		[key: string]: {
			path: string
			params: PtzCommandParams
		}
	}

	const commands: Commands = {}
	const actions: CompanionActionDefinitions = {}

	const ACTION_FUNC = async (event: CompanionActionEvent) => {
		const v = commands[event.options.val as string]
		await self.sendCommand(v.path, v.params)
	}
	const SPEED_PARAM_ACTION_FUNC = async (event: CompanionActionEvent) => {
		const v = commands[event.options.val as string]
		const p = structuredClone(v.params)
		const speed = (event.options.speed as number).toString()
		const half = Math.floor((event.options.speed as number) / 2).toString()
		if (p.PanTiltMove) {
			p.PanTiltMove = (p.PanTiltMove as string).replaceAll('{speed}', speed).replaceAll('{speed/2}', half)
		} else if (p.ZoomMove) {
			p.ZoomMove = (p.ZoomMove as string).replaceAll('{speed}', speed).replaceAll('{speed/2}', half)
		}
		await self.sendCommand(v.path, p)
	}

	COMMAND_LIST.forEach((item) => {
		commands[item[2]] = {
			path: item[3],
			params: item[4],
		}
		const k: string = item[0].toLowerCase().replace(/\s/g, '_') + '_action'
		if (k in actions) {
			;(actions[k]?.options[0] as CompanionInputFieldDropdown).choices.push({ id: item[2], label: item[1] })
		} else {
			const action: CompanionActionDefinition = {
				name: item[0],
				options: [
					{
						id: 'val',
						type: 'dropdown',
						label: item[0],
						choices: [{ id: item[2], label: item[1] }],
						default: 0,
					},
				],
				callback: ACTION_FUNC,
			}
			// Add speed settings for PTZ Move and PTZ Zoom
			if (item[0] === 'PTZ Move') {
				action.options.push({
					id: 'speed',
					type: 'number',
					label: 'Speed',
					default: DEFAULT_PTZ_MOVE_SPEED,
					min: 0,
					max: 24,
				})
				action.callback = SPEED_PARAM_ACTION_FUNC
			} else if (item[0] === 'PTZ Zoom') {
				action.options.push({
					id: 'speed',
					type: 'number',
					label: 'Speed',
					default: DEFAULT_PTZ_ZOOM_SPEED,
					min: 0,
					max: 32766,
				})
				action.callback = SPEED_PARAM_ACTION_FUNC
			}
			actions[k] = action
		}
		if (item[5]) {
			;(actions[k]?.options[0] as CompanionInputFieldDropdown).default = item[2]
		}
	})

	// PTZ Step
	actions['ptz_step_action'] = {
		name: 'PTZ Step',
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
				default: 'zoom',
			},
			{
				id: 'step',
				type: 'number',
				label: 'Step',
				default: DEFAULT_PTZ_STEP,
				min: -9999,
				max: 9999,
			},
		],
		callback: async (event: CompanionActionEvent) => {
			const focus = self.getVariableValue('focusPos')
			if (focus === '') {
				return
			}

			const target = event.options.target as string
			const step = (event.options.step as number) * 51.2
			let [pan, tilt, zoom] = [
				(self.getVariableValue('panPos') || 0) as number,
				(self.getVariableValue('tiltPos') || 0) as number,
				(self.getVariableValue('zoomPos') || 0) as number,
			]

			if (target === 'pan') {
				pan = clamp(self, pan + step, 'panRangeLeft', 'panRangeRight')
				self.setVariableValues({ panPos: pan })
			} else if (target === 'tilt') {
				tilt = clamp(self, tilt + step, 'tiltRangeLower', 'tiltRangeUpper')
				self.setVariableValues({ tiltPos: tilt })
			} else if (target === 'zoom') {
				zoom = clamp(self, zoom + step, 'zoomRangeWide', 'zoomRangeTele')
				self.setVariableValues({ zoomPos: zoom })
			}
			await self.sendCommand('command/ptzf.cgi', {
				AbsolutePTZF: `${to16(pan)},${to16(tilt)},${to16(zoom)},${to16(focus as number)}`,
			})
		},
	}

	// Other Commands
	actions['other_command_action'] = {
		name: 'Other Command',
		options: [
			{
				id: 'path',
				type: 'textinput',
				label: 'Path',
			},
			{
				id: 'params',
				type: 'textinput',
				label: 'Params',
			},
		],
		callback: async (event: CompanionActionEvent) => {
			const path = event.options.path as string
			const params = Object.fromEntries((event.options.params as string).split('&').map((x) => x.split(/(?<=^[^=]+)=/)))
			await self.sendCommand(path, params)
		},
	}

	self.setActionDefinitions(actions)
}
