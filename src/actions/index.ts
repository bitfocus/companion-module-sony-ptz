import type { ModuleInstance } from '../main.js'
import { systemActions } from './system.js'
import { autoFramingActions } from './autoframing.js'
import { ptzActions } from './ptz.js'
import { focusActions } from './focus.js'
import { imagingActions } from './imaging.js'
import { tallyActions } from './tally.js'
import { presetActions } from './preset.js'
import { sceneFileActions } from './scenefile.js'
import { miscActions } from './misc.js'

// Re-exported for presets.ts, which imports these from the actions module.
export { DEFAULT_PTZ_MOVE_SPEED, DEFAULT_PTZ_ZOOM_SPEED, DEFAULT_PTZ_STEP } from './constants.js'

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		...systemActions(self),
		...autoFramingActions(self),
		...ptzActions(self),
		...focusActions(self),
		...imagingActions(self),
		...tallyActions(self),
		...presetActions(self),
		...sceneFileActions(self),
		...miscActions(self),
	})
}
