import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModuleInstance } from '../main.js'

export function systemActions(self: ModuleInstance): CompanionActionDefinitions {
	return {
		system_power_action: {
			name: 'System - Power',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'State',
					default: 'system_on',
					choices: [
						{ id: 'system_on', label: 'ON' },
						{ id: 'system_standby', label: 'Standby' },
					],
				},
			],
			callback: async ({ options }) => {
				switch (options.val) {
					case 'system_on':
						await self.api?.system.setPower('on')
						break
					case 'system_standby':
						await self.api?.system.setPower('standby')
						break
				}
			},
		},
	}
}
