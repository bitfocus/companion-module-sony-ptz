import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModuleInstance } from '../main.js'
import { resolveNumber } from './helpers.js'

export function presetActions(self: ModuleInstance): CompanionActionDefinitions {
	return {
		preset_call_action: {
			name: 'PTZ Presets - Recall',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'Preset Call',
					default: 'preset_1',
					choices: [
						{ id: 'preset_back', label: 'Look Back' },
						{ id: 'preset_home', label: 'PTZ Home' },
						{ id: 'autoframing_home', label: 'Auto Framing Start Position' },
						{ id: 'preset_custom', label: 'Custom Number / Variable' },
						...Array.from({ length: 10 }, (_, i) => ({ id: `preset_${i + 1}`, label: `${i + 1}` })),
					],
				},
				{
					id: 'custom',
					type: 'textinput',
					label: 'Preset Number',
					tooltip: 'Preset number to recall. Supports variables.',
					default: '1',
					useVariables: true,
					isVisibleExpression: `$(options:val) == 'preset_custom'`,
				},
			],
			callback: async ({ options }) => {
				if (!self.api) return
				switch (options.val) {
					case 'preset_back':
						return self.api.preset.lookBack()
					case 'preset_home':
						return self.api.preset.home()
					case 'autoframing_home':
						return self.api.autoFraming.moveStartPosition()
					case 'preset_custom': {
						const num = resolveNumber(options.custom, NaN)
						if (!Number.isFinite(num) || num < 1) {
							self.log('warn', `PTZ Presets - Recall: invalid preset number "${String(options.custom)}"`)
							return
						}
						return self.api.preset.call(num)
					}
					default:
						return self.api.preset.call(Number(String(options.val).replace('preset_', '')))
				}
			},
		},
		preset_set_action: {
			name: 'PTZ Presets - Store',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'Preset Set',
					default: 'preset_set_1',
					choices: [
						...Array.from({ length: 10 }, (_, i) => ({ id: `preset_set_${i + 1}`, label: `${i + 1}` })),
						{ id: 'preset_set_custom', label: 'Custom Number / Variable' },
					],
				},
				{
					id: 'custom',
					type: 'textinput',
					label: 'Preset Number',
					tooltip: 'Preset number to store. Supports variables.',
					default: '1',
					useVariables: true,
					isVisibleExpression: `$(options:val) == 'preset_set_custom'`,
				},
			],
			callback: async ({ options }) => {
				if (!self.api) return
				if (options.val === 'preset_set_custom') {
					const num = resolveNumber(options.custom, NaN)
					if (!Number.isFinite(num) || num < 1) {
						self.log('warn', `PTZ Presets - Store: invalid preset number "${String(options.custom)}"`)
						return
					}
					return self.api.preset.set(num)
				}
				await self.api.preset.set(Number(String(options.val).replace('preset_set_', '')))
			},
		},
	}
}
