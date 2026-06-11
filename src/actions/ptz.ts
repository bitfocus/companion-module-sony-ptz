import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModuleInstance } from '../main.js'
import { resolveSpeed } from './helpers.js'
import { DEFAULT_PTZ_MOVE_SPEED, DEFAULT_PTZ_STEP, DEFAULT_PTZ_ZOOM_SPEED } from './constants.js'

/** Clamp a value to the camera's reported movement range (variables), with hardware fallbacks. */
function clamp(self: ModuleInstance, value: number, min: string, max: string): number {
	const _min = self.getVariableValue(min)
	const _max = self.getVariableValue(max)
	return Math.min(Math.max(value, _min === '' ? -0xffff : (_min as number)), _max === '' ? 0xffff : (_max as number))
}

export function ptzActions(self: ModuleInstance): CompanionActionDefinitions {
	return {
		ptz_reset_action: {
			name: 'PTZ - Reset',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'PTZ Reset',
					default: 'ptzf_reset',
					choices: [{ id: 'ptzf_reset', label: 'Reset' }],
				},
			],
			callback: async () => {
				await self.api?.ptz.reset()
			},
		},
		ptz_move_action: {
			name: 'PTZ - Move',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'PTZ Move',
					default: 'move_up',
					choices: [
						{ id: 'move_up', label: 'Up' },
						{ id: 'move_down', label: 'Down' },
						{ id: 'move_left', label: 'Left' },
						{ id: 'move_right', label: 'Right' },
						{ id: 'move_up_left', label: 'Up Left' },
						{ id: 'move_up_right', label: 'Up Right' },
						{ id: 'move_down_left', label: 'Down Left' },
						{ id: 'move_down_right', label: 'Down Right' },
					],
				},
				{
					id: 'speed',
					type: 'textinput',
					label: 'Speed (0-24)',
					tooltip: 'Pan/tilt speed. Supports variables; value is clamped to 0-24.',
					default: DEFAULT_PTZ_MOVE_SPEED.toString(),
					useVariables: true,
				},
			],
			callback: async ({ options }) => {
				if (!self.api) return
				const speed = resolveSpeed(options.speed, DEFAULT_PTZ_MOVE_SPEED)
				switch (options.val) {
					case 'move_up':
						return self.api.ptz.move('up', 0, speed)
					case 'move_down':
						return self.api.ptz.move('down', 0, speed)
					case 'move_left':
						return self.api.ptz.move('left', speed, 0)
					case 'move_right':
						return self.api.ptz.move('right', speed, 0)
					case 'move_up_left':
						return self.api.ptz.move('up-left', speed, speed)
					case 'move_up_right':
						return self.api.ptz.move('up-right', speed, speed)
					case 'move_down_left':
						return self.api.ptz.move('down-left', speed, speed)
					case 'move_down_right':
						return self.api.ptz.move('down-right', speed, speed)
				}
			},
		},
		ptz_zoom_action: {
			name: 'PTZ - Zoom',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'PTZ Zoom',
					default: 'zoom_tele',
					choices: [
						{ id: 'zoom_tele', label: 'Tele' },
						{ id: 'zoom_wide', label: 'Wide' },
					],
				},
				{
					id: 'speed',
					type: 'textinput',
					label: 'Speed (0-32766)',
					tooltip: 'Zoom speed. Supports variables; value is clamped to 0-32766.',
					default: DEFAULT_PTZ_ZOOM_SPEED.toString(),
					useVariables: true,
				},
			],
			callback: async ({ options }) => {
				if (!self.api) return
				const speed = resolveSpeed(options.speed, DEFAULT_PTZ_ZOOM_SPEED)
				switch (options.val) {
					case 'zoom_tele':
						return self.api.ptz.zoom('tele', speed)
					case 'zoom_wide':
						return self.api.ptz.zoom('wide', speed)
				}
			},
		},
		ptz_move_stop_action: {
			name: 'PTZ - Move Stop',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'PTZ Move Stop',
					default: 'stop_pantilt',
					choices: [
						{ id: 'stop_pantilt', label: 'Pan/Tilt' },
						{ id: 'stop_zoom', label: 'Tele/Wide' },
						{ id: 'stop_focus', label: 'Focus' },
						{ id: 'stop_motor', label: 'Motor' },
					],
				},
			],
			callback: async ({ options }) => {
				switch (options.val) {
					case 'stop_pantilt':
						await self.api?.ptz.stop('pantilt')
						break
					case 'stop_zoom':
						await self.api?.ptz.stop('zoom')
						break
					case 'stop_focus':
						await self.api?.ptz.stop('focus')
						break
					case 'stop_motor':
						await self.api?.ptz.stop('motor')
						break
				}
			},
		},
		ptz_step_action: {
			name: 'PTZ - Step',
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
				{ id: 'step', type: 'number', label: 'Step', default: DEFAULT_PTZ_STEP, min: -9999, max: 9999 },
			],
			callback: async ({ options }) => {
				self.lastStepTime = Date.now()

				const focus = self.getVariableValue('focusPos')
				if (focus === '') return

				const target = options.target as string
				const step = (options.step as number) * 51.2
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
				await self.api?.ptz.absolutePTZF(pan, tilt, zoom, focus as number)
			},
		},
		absolute_focus_action: {
			name: 'Absolute Focus',
			options: [{ id: 'val1', type: 'textinput', label: 'Value1', default: '0000', useVariables: true }],
			callback: async ({ options }) => {
				await self.api?.raw('command/ptzf.cgi', { AbsoluteFocus: String(options.val1 ?? '') })
			},
		},
		absolute_zoom_action: {
			name: 'Absolute Zoom',
			options: [{ id: 'val1', type: 'textinput', label: 'Value1', default: '0000', useVariables: true }],
			callback: async ({ options }) => {
				await self.api?.raw('command/ptzf.cgi', { AbsoluteZoom: String(options.val1 ?? '') })
			},
		},
		absolute_ptzf_action: {
			name: 'Absolute PTZF',
			options: [
				{ id: 'val1', type: 'textinput', label: 'Value1', default: '00000', useVariables: true },
				{ id: 'val2', type: 'textinput', label: 'Value2', default: '00000', useVariables: true },
				{ id: 'val3', type: 'textinput', label: 'Value3', default: '0000', useVariables: true },
				{ id: 'val4', type: 'textinput', label: 'Value4', default: '0000', useVariables: true },
			],
			callback: async ({ options }) => {
				const v = [options.val1, options.val2, options.val3, options.val4].map((x) => String(x ?? ''))
				await self.api?.raw('command/ptzf.cgi', { AbsolutePTZF: v.join(',') })
			},
		},
		absolute_pantilt_action: {
			name: 'Absolute PanTilt',
			options: [
				{ id: 'val1', type: 'textinput', label: 'Value1', default: '0000', useVariables: true },
				{ id: 'val2', type: 'textinput', label: 'Value2', default: '0000', useVariables: true },
				{ id: 'val3', type: 'textinput', label: 'Value3', default: '12', useVariables: true },
			],
			callback: async ({ options }) => {
				const v = [options.val1, options.val2, options.val3].map((x) => String(x ?? ''))
				await self.api?.raw('command/ptzf.cgi', { AbsolutePanTilt: v.join(',') })
			},
		},
		relative_pantilt_action: {
			name: 'Relative PanTilt',
			options: [
				{ id: 'val1', type: 'textinput', label: 'Value1', default: '0000', useVariables: true },
				{ id: 'val2', type: 'textinput', label: 'Value2', default: '0000', useVariables: true },
				{ id: 'val3', type: 'textinput', label: 'Value3', default: '12', useVariables: true },
			],
			callback: async ({ options }) => {
				const v = [options.val1, options.val2, options.val3].map((x) => String(x ?? ''))
				await self.api?.raw('command/ptzf.cgi', { RelativePanTilt: v.join(',') })
			},
		},
	}
}
