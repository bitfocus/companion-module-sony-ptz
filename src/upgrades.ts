import { type CompanionStaticUpgradeResult, type CompanionStaticUpgradeScript } from '@companion-module/base'
import type { ModuleConfig, ModuleSecrets } from './config.js'

const MovePasswordToSecrets: CompanionStaticUpgradeScript<ModuleConfig, ModuleSecrets> = (_context, props) => {
	const result: CompanionStaticUpgradeResult<ModuleConfig, ModuleSecrets> = {
		updatedConfig: null,
		updatedSecrets: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	if (props.config) {
		const oldConfig = props.config as ModuleConfig & { pass?: string }
		if (oldConfig.pass) {
			const updatedSecrets: ModuleSecrets = props.secrets ?? { pass: oldConfig.pass }
			result.updatedConfig = oldConfig

			if (!updatedSecrets.pass) {
				updatedSecrets.pass = oldConfig.pass
			}
			delete oldConfig.pass

			result.updatedSecrets = updatedSecrets
		}
	}

	return result
}

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig, ModuleSecrets>[] = [MovePasswordToSecrets]
