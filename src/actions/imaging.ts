import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModuleInstance } from '../main.js'
import { resolveNumber } from './helpers.js'

const DEFAULT_WB_GAIN = 128

export function imagingActions(self: ModuleInstance): CompanionActionDefinitions {
	return {
		white_balance_mode_action: {
			name: 'Imaging - White Balance Mode',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'White Balance Mode',
					default: 'wb_auto',
					choices: [
						{ id: 'wb_auto', label: 'Auto' },
						{ id: 'wb_indoor', label: 'Indoor' },
						{ id: 'wb_outdoor', label: 'Outdoor' },
						{ id: 'wb_onepushwb', label: 'One Push WB' },
						{ id: 'wb_atw', label: 'ATW' },
						{ id: 'wb_manual', label: 'Manual' },
					],
				},
			],
			callback: async ({ options }) => {
				switch (options.val) {
					case 'wb_auto':
						await self.api?.imaging.setWhiteBalanceMode('auto')
						break
					case 'wb_indoor':
						await self.api?.imaging.setWhiteBalanceMode('indoor')
						break
					case 'wb_outdoor':
						await self.api?.imaging.setWhiteBalanceMode('outdoor')
						break
					case 'wb_onepushwb':
						await self.api?.imaging.setWhiteBalanceMode('onepushwb')
						break
					case 'wb_atw':
						await self.api?.imaging.setWhiteBalanceMode('atw')
						break
					case 'wb_manual':
						await self.api?.imaging.setWhiteBalanceMode('manual')
						break
				}
			},
		},
		white_balance_cb_gain_action: {
			name: 'Imaging - White Balance Blue (Cb) Gain',
			options: [
				{
					id: 'val',
					type: 'textinput',
					label: 'Blue (Cb) Gain (0-255)',
					tooltip: 'Manual white balance blue gain. Supports variables; value is clamped to 0-255.',
					default: DEFAULT_WB_GAIN.toString(),
					useVariables: true,
				},
			],
			callback: async ({ options }) => {
				await self.api?.imaging.setWhiteBalanceCbGain(resolveNumber(options.val, DEFAULT_WB_GAIN))
			},
		},
		white_balance_cr_gain_action: {
			name: 'Imaging - White Balance Red (Cr) Gain',
			options: [
				{
					id: 'val',
					type: 'textinput',
					label: 'Red (Cr) Gain (0-255)',
					tooltip: 'Manual white balance red gain. Supports variables; value is clamped to 0-255.',
					default: DEFAULT_WB_GAIN.toString(),
					useVariables: true,
				},
			],
			callback: async ({ options }) => {
				await self.api?.imaging.setWhiteBalanceCrGain(resolveNumber(options.val, DEFAULT_WB_GAIN))
			},
		},
		image_stabilizer_action: {
			name: 'Imaging - Image Stabilizer',
			description: 'Note: Not available while PTZ Auto Framing is active.',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'Image Stabilizer',
					default: 'stabilizer_on',
					choices: [
						{ id: 'stabilizer_on', label: 'On' },
						{ id: 'stabilizer_off', label: 'Off' },
					],
				},
			],
			callback: async ({ options }) => {
				await self.api?.imaging.setStabilizer(options.val === 'stabilizer_on')
			},
		},
	}
}
