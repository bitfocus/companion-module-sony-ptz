import type { CompanionActionDefinitions, CompanionActionEvent } from '@companion-module/base'
import type { ModuleInstance } from '../main.js'
import { discover } from '../api/transport.js'
import { MAX_FOUND_DEVICES } from '../variables.js'

export function miscActions(self: ModuleInstance): CompanionActionDefinitions {
	return {
		generic_step_action: {
			name: 'Generic Step',
			options: [
				{ id: 'path', type: 'textinput', label: 'Path', useVariables: true },
				{ id: 'param', type: 'textinput', label: 'Param', useVariables: true },
				{ id: 'step', type: 'number', label: 'Step', default: 1, min: -9999, max: 9999 },
				{ id: 'max', type: 'number', label: 'Max', default: 9999, min: -999999, max: 999999 },
				{ id: 'min', type: 'number', label: 'Min', default: 0, min: -999999, max: 999999 },
			],
			callback: async (event: CompanionActionEvent) => {
				self.lastStepTime = Date.now()

				const path = event.options.path as string
				const param = event.options.param as string
				const step = event.options.step as number
				const max = event.options.max as number
				const min = event.options.min as number
				const valname = param.charAt(0).toLowerCase() + param.slice(1)
				let value = (self.getVariableValue(valname) || 0) as number
				value = Math.min(Math.max(value + step, min), max)

				self.setVariableValues({ [valname]: value })
				await self.api?.raw(path, { [param]: value.toString() })
			},
		},
		other_command_action: {
			name: 'Other Command',
			options: [
				{ id: 'path', type: 'textinput', label: 'Path', useVariables: true },
				{ id: 'params', type: 'textinput', label: 'Params', useVariables: true },
			],
			callback: async (event: CompanionActionEvent) => {
				const path = event.options.path as string
				const paramsStr = event.options.params as string
				const params = Object.fromEntries(paramsStr.split('&').map((x) => x.split(/(?<=^[^=]+)=/)))
				await self.api?.raw(path, params)
			},
		},
		discover_cameras_action: {
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
		},
		host_update_action: {
			name: 'Update Target IP via Variable',
			options: [{ id: 'host', type: 'textinput', label: 'Host', useVariables: true }],
			callback: async (event: CompanionActionEvent) => {
				const host = event.options.host as string
				if (host && self.config.host !== host) {
					const newConfig = { ...self.config, host }
					self.saveConfig(newConfig, self.secrets)
					// saveConfig only persists to the UI; apply it so the module reconnects to the new host.
					await self.configUpdated(newConfig, self.secrets)
				}
			},
		},
	}
}
