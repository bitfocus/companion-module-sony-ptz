import type {
	CompanionActionDefinition,
	CompanionActionDefinitions,
	CompanionActionEvent,
	CompanionInputFieldDropdown,
} from '@companion-module/base'
import { MAX_FOUND_DEVICES } from './variables.js'
import type { ModuleInstance } from './main.js'
import { PtzCommandParams, discover } from './sonyptz.js'

export const DEFAULT_PTZ_MOVE_SPEED = 8
export const DEFAULT_PTZ_ZOOM_SPEED = 8000
export const DEFAULT_PTZ_STEP = 5
export const SPEED_PARAM_ACTIONS = ['PTZ Move', 'PTZ Zoom']

export type CommandSpec = [string, string, string, string, PtzCommandParams, boolean]
export type CommandSpecWithValues = [string, string, string, string, string[]]

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

		//System Power
		['System Power', 'ON', 'system_on', 'command/main.cgi', { System: 'on' }, true],
		['System Power', 'Standby', 'system_standby', 'command/main.cgi', { System: 'standby' }, false],

		//Auto Framing
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
		// Person/Ball Sports Framing switching (PtzAutoFramingFramingMode)
		[
			'Framing Mode',
			'Person',
			'autoframing_person',
			'analytics/ptzautoframing.cgi',
			{ PtzAutoFramingFramingMode: 'person' },
			true,
		],
		[
			'Framing Mode',
			'Ball Sports',
			'autoframing_ball',
			'analytics/ptzautoframing.cgi',
			{ PtzAutoFramingFramingMode: 'ball_sports' },
			false,
		],
		// Lead Room Effect (PtzAutoFramingLeadRoomLevel)
		[
			'Lead Room Effect',
			'OFF',
			'autoframing_leadroom_off',
			'analytics/ptzautoframing.cgi',
			{ PtzAutoFramingLeadRoomLevel: 'off' },
			false,
		],
		[
			'Lead Room Effect',
			'Low',
			'autoframing_leadroom_low',
			'analytics/ptzautoframing.cgi',
			{ PtzAutoFramingLeadRoomLevel: 'low' },
			false,
		],
		[
			'Lead Room Effect',
			'Middle',
			'autoframing_leadroom_middle',
			'analytics/ptzautoframing.cgi',
			{ PtzAutoFramingLeadRoomLevel: 'middle' },
			true,
		],
		[
			'Lead Room Effect',
			'High',
			'autoframing_leadroom_high',
			'analytics/ptzautoframing.cgi',
			{ PtzAutoFramingLeadRoomLevel: 'high' },
			false,
		],
		// Real-time Overlay (Frame/Area Indicator) ON/OFF (PtzAutoFramingFaceIndicatorEnable3)
		[
			'Auto Framing - Frame/Area Indicator',
			'ON',
			'autoframing_faceindicator_on',
			'analytics/ptzautoframing.cgi',
			{ PtzAutoFramingFaceIndicatorEnable3: 'on' },
			true,
		],
		[
			'Auto Framing - Frame/Area Indicator',
			'OFF',
			'autoframing_faceindicator_off',
			'analytics/ptzautoframing.cgi',
			{ PtzAutoFramingFaceIndicatorEnable3: 'off' },
			false,
		],
		[
			'Auto Framing Shot Mode',
			'Closer Closeup',
			'autoframing_closer_closeup',
			'analytics/ptzautoframing.cgi',
			{ PtzAutoFramingAdjustSetting: '0,0,200' },
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
		[
			'Multi Tracking Num',
			'1',
			'multitrackingnum_1',
			'analytics/ptzautoframing.cgi',
			{ PtzAutoFramingMultiTrackingEnable: 'off' },
			true,
		],

		//PTZ Reset
		['PTZ Reset', 'Reset', 'ptzf_reset', 'command/ptzf.cgi', { PanTiltReset: 'on' }, true],

		//Presets
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

		//PTZ Movement
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

		//Focus Mode
		['Auto Focus Mode', 'Normal', 'afmode_normal', 'command/ptzf.cgi', { AFMode: 'normal' }, true],
		['Auto Focus Mode', 'Interval', 'afmode_interval', 'command/ptzf.cgi', { AFMode: 'interval' }, false],
		['Auto Focus Mode', 'Zoom Trigger', 'afmode_zoomtrigger', 'command/ptzf.cgi', { AFMode: 'zoomtrigger' }, false],
		['Auto Focus Sensitivity', 'Normal', 'afsensitivity_normal', 'command/ptzf.cgi', { AFSensitivity: 'normal' }, true],
		['Auto Focus Sensitivity', 'Low', 'afsensitivity_low', 'command/ptzf.cgi', { AFSensitivity: 'low' }, false],
		['Focus Mode', 'Auto', 'focus_auto', 'command/ptzf.cgi', { FocusMode: 'auto' }, true],
		['Focus Mode', 'Manual', 'focus_manual', 'command/ptzf.cgi', { FocusMode: 'manual' }, false],

		//Fixed Angle Position (SRG-A40/A12)
		[
			'Fixed Angle Position',
			'OFF',
			'fixedangle_off',
			'analytics/ptzautoframing.cgi',
			{ PtzAutoFramingFixedAngleEnable: '1,off' },
			true,
		],
		[
			'Fixed Angle Position',
			'ON',
			'fixedangle_on',
			'analytics/ptzautoframing.cgi',
			{ PtzAutoFramingFixedAngleEnable: '1,on' },
			false,
		],
		[
			'Fixed Angle Position',
			'Store Current Position',
			'fixedangle_store',
			'analytics/ptzautoframingexe.cgi',
			{ PtzAutoFramingFixedAnglePositionSet: '1' },
			false,
		],
		[
			'Fixed Angle Position',
			'Recall Position',
			'fixedangle_recall',
			'analytics/ptzautoframingexe.cgi',
			{ PtzAutoFramingFixedAnglePositionCall: '1' },
			false,
		],
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
		// Scene File Recall (BRC-AM7) — SceneFileCurrentSceneFile: 0=Off, 1-16=scene file
		// @ts-expect-error  The first param will not be used
		...[...Array(17)].map((x, i) => [
			'Scene File Recall',
			i === 0 ? 'Off' : i.toString(),
			i === 0 ? 'scenefile_off' : `scenefile_set_${i}`,
			'command/scenefile.cgi',
			{ SceneFileCurrentSceneFile: `${i}` },
			i === 0,
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
			self.lastStepTime = Date.now()

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

	// [actionId, label, commandPath, paramName, defaultValues[]]
	const COMMAND_LIST_WITH_VALUES: CommandSpecWithValues[] = [
		['Absolute Focus', 'Absolute Focus', 'command/ptzf.cgi', 'AbsoluteFocus', ['0000']],
		['Absolute Zoom', 'Absolute Zoom', 'command/ptzf.cgi', 'AbsoluteZoom', ['0000']],
		['Absolute PTZF', 'Absolute PTZF', 'command/ptzf.cgi', 'AbsolutePTZF', ['00000', '00000', '0000', '0000']],
		['Absolute PanTilt', 'Absolute PanTilt', 'command/ptzf.cgi', 'AbsolutePanTilt', ['0000', '0000', '12']],
		['Relative PanTilt', 'Relative PanTilt', 'command/ptzf.cgi', 'RelativePanTilt', ['0000', '0000', '12']],
		// Fine Adjustment of Fixed Angle Position (SRG-A40/A12) — Value1=angle #, then relative hex offsets
		[
			'Fixed Angle Fine PanTilt',
			'Fixed Angle Fine Pan/Tilt',
			'analytics/ptzautoframingexe.cgi',
			'PtzAutoFramingFixedAngleRelativePanTilt',
			['1', '0000', '0000'],
		],
		[
			'Fixed Angle Fine Zoom',
			'Fixed Angle Fine Zoom',
			'analytics/ptzautoframingexe.cgi',
			'PtzAutoFramingFixedAngleRelativeZoom',
			['1', '0000'],
		],
	]

	COMMAND_LIST_WITH_VALUES.forEach((item) => {
		const k: string = item[0].toLowerCase().replace(/\s/g, '_') + '_action'
		const action: CompanionActionDefinition = {
			name: item[1],
			options: item[4].map((val, idx) => ({
				id: 'val' + (idx + 1),
				type: 'textinput',
				label: `Value${idx + 1}`,
				default: val,
				useVariables: true,
			})),
			callback: async (event: CompanionActionEvent) => {
				const vars: string[] = item[4].map((_, idx) => event.options['val' + (idx + 1)]!.toString())
				await self.sendCommand(item[2], { [item[3]]: vars.join(',') })
			},
		}
		actions[k] = action
	})

	// Auto Framing tracking Speed / Sensitivity per axis (BRC-AM7)
	const AF_AXIS_CHOICES = [
		{ id: 'Pan', label: 'Pan' },
		{ id: 'Tilt', label: 'Tilt' },
		{ id: 'Zoom', label: 'Zoom' },
	]
	actions['autoframing_tracking_speed_action'] = {
		name: 'Auto Framing Tracking Speed',
		options: [
			{ id: 'axis', type: 'dropdown', label: 'Axis', choices: AF_AXIS_CHOICES, default: 'Pan' },
			{ id: 'value', type: 'number', label: 'Speed (1-5)', default: 4, min: 1, max: 5 },
		],
		callback: async (event: CompanionActionEvent) => {
			await self.sendCommand('analytics/ptzautoframing.cgi', {
				[`PtzAutoFramingSpeed${event.options.axis}`]: (event.options.value as number).toString(),
			})
		},
	}
	actions['autoframing_tracking_sensitivity_action'] = {
		name: 'Auto Framing Tracking Sensitivity',
		options: [
			{ id: 'axis', type: 'dropdown', label: 'Axis', choices: AF_AXIS_CHOICES, default: 'Pan' },
			{ id: 'value', type: 'number', label: 'Sensitivity (0-5)', default: 3, min: 0, max: 5 },
		],
		callback: async (event: CompanionActionEvent) => {
			await self.sendCommand('analytics/ptzautoframing.cgi', {
				[`PtzAutoFramingSensitivity${event.options.axis}`]: (event.options.value as number).toString(),
			})
		},
	}

	actions['generic_step_action'] = {
		name: 'Generic Step',
		options: [
			{
				id: 'path',
				type: 'textinput',
				label: 'Path',
				useVariables: true,
			},
			{
				id: 'param',
				type: 'textinput',
				label: 'Param',
				useVariables: true,
			},
			{
				id: 'step',
				type: 'number',
				label: 'Step',
				default: 1,
				min: -9999,
				max: 9999,
			},
			{
				id: 'max',
				type: 'number',
				label: 'Max',
				default: 9999,
				min: -999999,
				max: 999999,
			},
			{
				id: 'min',
				type: 'number',
				label: 'Min',
				default: 0,
				min: -999999,
				max: 999999,
			},
		],
		callback: async (event: CompanionActionEvent) => {
			self.lastStepTime = Date.now()

			const path = await self.parseVariablesInString(event.options.path as string)
			const param = await self.parseVariablesInString(event.options.param as string)
			const step = event.options.step as number
			const max = event.options.max as number
			const min = event.options.min as number
			const valname = param.charAt(0).toLowerCase() + param.slice(1)
			let value = (self.getVariableValue(valname) || 0) as number
			value = Math.min(Math.max(value + step, min), max)

			self.setVariableValues({ [valname]: value })

			await self.sendCommand(path, {
				[param]: value.toString(),
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
				useVariables: true,
			},
			{
				id: 'params',
				type: 'textinput',
				label: 'Params',
				useVariables: true,
			},
		],
		callback: async (event: CompanionActionEvent) => {
			const path = await self.parseVariablesInString(event.options.path as string)
			const paramsStr = await self.parseVariablesInString(event.options.params as string)
			const params = Object.fromEntries(paramsStr.split('&').map((x) => x.split(/(?<=^[^=]+)=/)))
			await self.sendCommand(path, params)
		},
	}

	// Discover Cameras
	actions['discover_cameras_action'] = {
		name: 'Discover Cameras',
		options: [],
		callback: async (_event: CompanionActionEvent) => {
			const devices = await discover()
			self.log('info', `Discovered cameras: ${devices.join(', ')}`)
			Array.from({ length: MAX_FOUND_DEVICES }, (_, i) => {
				const varId = `foundDevice${i + 1}`
				const value = devices[i] || ''
				self.setVariableValues({ [varId]: value })
			})
		},
	}

	actions['host_update_action'] = {
		name: 'Update Target IP via Variable',
		options: [
			{
				id: 'host',
				type: 'textinput',
				label: 'Host',
				useVariables: true,
			},
		],
		callback: async (event: CompanionActionEvent) => {
			const host = await self.parseVariablesInString(event.options.host as string)
			if (host && self.config.host !== host) {
				const newConfig = { ...self.config, host }
				self.saveConfig(newConfig)
			}
		},
	}

	self.setActionDefinitions(actions)
}
