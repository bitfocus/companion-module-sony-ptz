import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModuleInstance } from '../main.js'

export function sceneFileActions(self: ModuleInstance): CompanionActionDefinitions {
	return {
		scene_file_recall_action: {
			name: 'Scene File Recall',
			options: [
				{
					id: 'val',
					type: 'dropdown',
					label: 'Scene File Recall',
					default: 'scenefile_off',
					// SceneFileCurrentSceneFile: 0 = Off, 1-16 = scene file (BRC-AM7).
					choices: [
						{ id: 'scenefile_off', label: 'Off' },
						...Array.from({ length: 16 }, (_, i) => ({ id: `scenefile_set_${i + 1}`, label: `${i + 1}` })),
					],
				},
			],
			callback: async ({ options }) => {
				const val = String(options.val)
				const num = val === 'scenefile_off' ? 0 : Number(val.replace('scenefile_set_', ''))
				await self.api?.sceneFile.recall(num)
			},
		},
	}
}
