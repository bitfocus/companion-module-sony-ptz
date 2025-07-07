import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	host: string
	port: number
	user: string
	pass: string
	referer: boolean
	polling: boolean
	interval: number
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 8,
			regex: Regex.IP,
		},
		{
			type: 'number',
			id: 'port',
			label: 'Target Port',
			width: 4,
			min: 1,
			max: 65535,
			default: 80,
		},
		{
			type: 'textinput',
			id: 'user',
			label: 'User',
			width: 6,
			regex: Regex.SOMETHING,
		},
		{
			type: 'textinput',
			id: 'pass',
			label: 'Password',
			width: 6,
		},
		{
			type: 'checkbox',
			id: 'referer',
			label: 'Referer',
			width: 2,
			default: true,
		},
		{
			type: 'checkbox',
			id: 'polling',
			label: 'Status Check',
			width: 4,
			default: true,
		},
		{
			type: 'number',
			id: 'interval',
			label: 'Status Check Interval',
			width: 4,
			min: 500,
			max: 60 * 60 * 1000,
			default: 10 * 1000,
		},
	]
}
