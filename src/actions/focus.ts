import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModuleInstance } from '../main.js'

export function focusActions(self: ModuleInstance): CompanionActionDefinitions {
	return {
		auto_focus_mode_action: {
			name: 'Auto Focus Mode',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'Focus - Auto Focus Mode',
					default: 'afmode_normal',
					choices: [
						{ id: 'afmode_normal', label: 'Normal' },
						{ id: 'afmode_interval', label: 'Interval' },
						{ id: 'afmode_zoomtrigger', label: 'Zoom Trigger' },
					],
				},
			],
			callback: async ({ options }) => {
				switch (options.val) {
					case 'afmode_normal':
						await self.api?.focus.setAFMode('normal')
						break
					case 'afmode_interval':
						await self.api?.focus.setAFMode('interval')
						break
					case 'afmode_zoomtrigger':
						await self.api?.focus.setAFMode('zoomtrigger')
						break
				}
			},
		},
		auto_focus_sensitivity_action: {
			name: 'Focus - Auto Focus Sensitivity',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'Auto Focus Sensitivity',
					default: 'afsensitivity_normal',
					choices: [
						{ id: 'afsensitivity_normal', label: 'Normal' },
						{ id: 'afsensitivity_low', label: 'Low' },
					],
				},
			],
			callback: async ({ options }) => {
				switch (options.val) {
					case 'afsensitivity_normal':
						await self.api?.focus.setAFSensitivity('normal')
						break
					case 'afsensitivity_low':
						await self.api?.focus.setAFSensitivity('low')
						break
				}
			},
		},
		focus_mode_action: {
			name: 'Focus - Mode (Auto/Manual)',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'Focus Mode',
					default: 'focus_auto',
					choices: [
						{ id: 'focus_auto', label: 'Auto' },
						{ id: 'focus_manual', label: 'Manual' },
					],
				},
			],
			callback: async ({ options }) => {
				switch (options.val) {
					case 'focus_auto':
						await self.api?.focus.setMode('auto')
						break
					case 'focus_manual':
						await self.api?.focus.setMode('manual')
						break
				}
			},
		},
	}
}
