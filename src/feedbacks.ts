import { combineRgb } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		power: {
			type: 'boolean',
			name: 'System power',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Power',
					id: 'power',
					choices: [
						{ id: 'on', label: 'On' },
						{ id: 'standby', label: 'Standby' },
					],
					default: 'standby',
				},
			],
			callback: (feedback) => {
				self.log('debug', `power: ${self.getFeedbackValue('power')}`)
				return self.getFeedbackValue('power') === feedback.options.power
			},
		},
	})
}
