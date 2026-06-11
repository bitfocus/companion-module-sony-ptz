import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModuleInstance } from '../main.js'

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
						...Array.from({ length: 10 }, (_, i) => ({ id: `preset_${i + 1}`, label: `${i + 1}` })),
					],
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
					choices: Array.from({ length: 10 }, (_, i) => ({ id: `preset_set_${i + 1}`, label: `${i + 1}` })),
				},
			],
			callback: async ({ options }) => {
				await self.api?.preset.set(Number(String(options.val).replace('preset_set_', '')))
			},
		},
	}
}
