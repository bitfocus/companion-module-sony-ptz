import type {
	AutoFramingStatus,
	PtzfStatus,
	SceneFileStatus,
	StreamStatus,
	SysInfoStatus,
	SystemStatus,
} from '../api/types.js'

export type StateKey =
	// Feedback keys
	| 'power'
	| 'autoFraming'
	| 'framingMode'
	| 'shotMode'
	| 'leadRoom'
	| 'realtimeOverlay'
	| 'fixedAngle'
	| 'trackingStatus'
	| 'sceneFile'
	| 'trackingSpeedPan'
	| 'trackingSpeedTilt'
	| 'trackingSpeedZoom'
	| 'trackingSensitivityPan'
	| 'trackingSensitivityTilt'
	| 'trackingSensitivityZoom'
	| 'multiTracking'
	| 'multiTrackingTargetNum'
	| 'focusMode'
	| 'focusSensitivity'
	| 'afMode'
	// Display-only variable keys
	| 'modelName'
	| 'name'
	| 'serial'
	| 'softVersion'
	| 'multiTrackingNum'
	| 'zoomMode'
	| 'absoluteFocus'
	| 'streamMode'
	| 'panRangeLeft'
	| 'panRangeRight'
	| 'tiltRangeLower'
	| 'tiltRangeUpper'
	| 'zoomRangeWide'
	| 'zoomRangeTele'
	| `sceneFileName${number}`

export type StateValue = string | number | undefined

export type StateFragment = Partial<Record<StateKey, StateValue>>

export class CameraState {
	private map = new Map<StateKey, StateValue>()

	get(key: StateKey): StateValue {
		return this.map.get(key)
	}

	/** Sets one key; returns true if the stored value changed. */
	set(key: StateKey, value: StateValue): boolean {
		if (this.map.get(key) === value) return false
		this.map.set(key, value)
		return true
	}

	/** Applies many keys at once; returns true if any value changed (so feedbacks check once per poll). */
	update(fragment: StateFragment): boolean {
		let changed = false
		for (const [key, value] of Object.entries(fragment)) {
			if (this.set(key as StateKey, value)) changed = true
		}
		return changed
	}
}

// ---- Mappers: typed inquiry fragments -> state keys -------------------------
// Each parsed query result maps to the state keys it owns. Keeping these here (rather than inline
// in main) means both the regular poll and the post-command refresh share identical mapping.

/** Power spans both sysinfo and system inquiries, matching the original combined precedence. */
export function stateFromSystemInfo(sysinfo: SysInfoStatus, system: SystemStatus): StateFragment {
	return {
		power: sysinfo.power || system.power || '',
		name: sysinfo.name,
		modelName: system.modelName,
		serial: system.serial || sysinfo.serial || '',
		softVersion: system.softVersion || sysinfo.softVersion || '',
	}
}

export function stateFromAutoFraming(s: AutoFramingStatus): StateFragment {
	return {
		autoFraming: s.autoFraming,
		framingMode: s.framingMode,
		shotMode: s.shotMode,
		leadRoom: s.leadRoom,
		realtimeOverlay: s.realtimeOverlay,
		fixedAngle: s.fixedAngle,
		trackingStatus: s.trackingStatus,
		trackingSpeedPan: s.trackingSpeed.Pan,
		trackingSpeedTilt: s.trackingSpeed.Tilt,
		trackingSpeedZoom: s.trackingSpeed.Zoom,
		trackingSensitivityPan: s.trackingSensitivity.Pan,
		trackingSensitivityTilt: s.trackingSensitivity.Tilt,
		trackingSensitivityZoom: s.trackingSensitivity.Zoom,
		multiTracking: s.multiTracking,
		multiTrackingTargetNum: s.multiTrackingTargetNum,
		multiTrackingNum: s.multiTrackingNum,
	}
}

export function stateFromPtzf(s: PtzfStatus): StateFragment {
	return {
		focusMode: s.focusMode,
		focusSensitivity: s.afSensitivity,
		afMode: s.afMode,
		zoomMode: s.zoomMode,
		absoluteFocus: s.absoluteFocus,
		panRangeLeft: s.panRangeLeft,
		panRangeRight: s.panRangeRight,
		tiltRangeLower: s.tiltRangeLower,
		tiltRangeUpper: s.tiltRangeUpper,
		zoomRangeWide: s.zoomRangeWide,
		zoomRangeTele: s.zoomRangeTele,
	}
}

export function stateFromStream(s: StreamStatus): StateFragment {
	return { streamMode: s.streamMode }
}

export function stateFromSceneFile(s: SceneFileStatus): StateFragment {
	return { sceneFile: s.currentSceneFile, ...s.names }
}
