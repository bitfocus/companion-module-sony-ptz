import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModuleInstance } from '../main.js'

export function tallyActions(self: ModuleInstance): CompanionActionDefinitions {
	return {
		tally_control_action: {
			name: 'Tally - Control',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'Tally Control',
					default: 'tally_on',
					choices: [
						{ id: 'tally_on', label: 'On' },
						{ id: 'tally_off', label: 'Off' },
					],
				},
			],
			callback: async ({ options }) => {
				await self.api?.tally.setControl(options.val === 'tally_on')
			},
		},
	}
}
