import { SonyPTZ, type PtzCommandParams } from './transport.js'
import type {
	AFMode,
	AFSensitivity,
	AutoFramingStatus,
	Axis,
	FocusMode,
	FramingMode,
	ImagingStatus,
	LeadRoomLevel,
	PaintStatus,
	PowerState,
	PtzDirection,
	PtzfStatus,
	SceneFileStatus,
	ShotModeZoom,
	StopTarget,
	StreamStatus,
	SysInfoStatus,
	SystemStatus,
	ZoomDirection,
} from './types.js'

export const MAX_PT_SPEED = 24
export const MAX_ZOOM_SPEED = 32766

// PtzAutoFramingLeadRoomLevel inquiry returns lowercase; feedback choices use Title Case.
const LEAD_ROOM_NAMES: Record<string, string> = { off: 'Off', low: 'Low', middle: 'Middle', high: 'High' }

function clampInt(value: number, min: number, max: number): number {
	return Math.min(Math.max(Math.round(value), min), max)
}

/** Convert a signed integer to a 4-char unsigned 16-bit hex string (camera wire format). */
export function to16(num: number): string {
	const int16 = new Int16Array(1)
	int16[0] = num
	return (int16[0] & 0xffff).toString(16).padStart(4, '0')
}

/** Parse a comma-separated list of 4-char hex values as signed 16-bit integers. */
function splitInt16Array(value: string): number[] {
	return value.split(',').map((x) => (parseInt(x, 16) << 16) >> 16)
}

export interface CameraApiHooks {
	/** Runs after every successful command so feedbacks/state can refresh without waiting for the poll. */
	postCommandRefresh?: (params: PtzCommandParams) => Promise<void> | void
	/** Runs when a command fails (queries are not routed here — callers handle those). */
	onError?: (err: unknown) => void
}

export class CameraApi {
	constructor(
		private transport: SonyPTZ,
		private hooks: CameraApiHooks = {},
	) {}

	private async exec(path: string, params: PtzCommandParams): Promise<void> {
		try {
			await this.transport.send({ path, params })
			await this.hooks.postCommandRefresh?.(params)
		} catch (e) {
			this.hooks.onError?.(e)
		}
	}

	/** Escape hatch for the Other Command / Generic Step actions that send arbitrary path+params. */
	async raw(path: string, params: PtzCommandParams): Promise<void> {
		return this.exec(path, params)
	}

	system = {
		setPower: async (state: PowerState): Promise<void> => this.exec('command/main.cgi', { System: state }),
	}

	autoFraming = {
		setEnabled: async (on: boolean): Promise<void> =>
			this.exec('analytics/ptzautoframing.cgi', { PtzAutoFraming: on ? 'on' : 'off' }),
		pause: async (on: boolean): Promise<void> =>
			this.exec('analytics/ptzautoframing.cgi', { PtzAutoFramingPause: on ? 'on' : 'off' }),
		restart: async (): Promise<void> => this.exec('analytics/ptzautoframingexe.cgi', { PtzAutoFramingRestart: 'on' }),
		setFramingMode: async (mode: FramingMode): Promise<void> =>
			this.exec('analytics/ptzautoframing.cgi', { PtzAutoFramingFramingMode: mode }),
		setShotMode: async (zoom: ShotModeZoom): Promise<void> =>
			this.exec('analytics/ptzautoframing.cgi', { PtzAutoFramingAdjustSetting: `0,0,${zoom}` }),
		setLeadRoom: async (level: LeadRoomLevel): Promise<void> =>
			this.exec('analytics/ptzautoframing.cgi', { PtzAutoFramingLeadRoomLevel: level }),
		setFaceIndicator: async (on: boolean): Promise<void> =>
			this.exec('analytics/ptzautoframing.cgi', { PtzAutoFramingFaceIndicatorEnable3: on ? 'on' : 'off' }),
		setTrackingSpeed: async (axis: Axis, value: number): Promise<void> =>
			this.exec('analytics/ptzautoframing.cgi', { [`PtzAutoFramingSpeed${axis}`]: value.toString() }),
		setTrackingSensitivity: async (axis: Axis, value: number): Promise<void> =>
			this.exec('analytics/ptzautoframing.cgi', { [`PtzAutoFramingSensitivity${axis}`]: value.toString() }),
		setMultiTracking: async (targets: number): Promise<void> =>
			targets <= 1
				? this.exec('analytics/ptzautoframing.cgi', { PtzAutoFramingMultiTrackingEnable: 'off' })
				: this.exec('analytics/ptzautoframing.cgi', {
						PtzAutoFramingMultiTrackingEnable: 'on',
						PtzAutoFramingMultiTrackingTargetNum: targets.toString(),
					}),
		setWaitTime: async (seconds: number): Promise<void> =>
			this.exec('analytics/ptzautoframing.cgi', { PtzAutoFramingMultiTrackingWaitTime: seconds }),
		decideStartPosition: async (): Promise<void> =>
			this.exec('analytics/ptzautoframingexe.cgi', { PtzAutoFramingDecideStartPosition: 'on' }),
		moveStartPosition: async (): Promise<void> =>
			this.exec('analytics/ptzautoframingexe.cgi', { PtzAutoFramingMoveStartPosition: 'on' }),
		fixedAngle: {
			setEnabled: async (on: boolean): Promise<void> =>
				this.exec('analytics/ptzautoframing.cgi', { PtzAutoFramingFixedAngleEnable: `1,${on ? 'on' : 'off'}` }),
			store: async (): Promise<void> =>
				this.exec('analytics/ptzautoframingexe.cgi', { PtzAutoFramingFixedAnglePositionSet: '1' }),
			recall: async (): Promise<void> =>
				this.exec('analytics/ptzautoframingexe.cgi', { PtzAutoFramingFixedAnglePositionCall: '1' }),
			fineAdjust: async (axis: Axis, step: number): Promise<void> => {
				const offset = to16(step)
				if (axis === 'Zoom') {
					return this.exec('analytics/ptzautoframingexe.cgi', {
						PtzAutoFramingFixedAngleRelativeZoom: `1,${offset}`,
					})
				}
				const pan = axis === 'Pan' ? offset : '0000'
				const tilt = axis === 'Tilt' ? offset : '0000'
				return this.exec('analytics/ptzautoframingexe.cgi', {
					PtzAutoFramingFixedAngleRelativePanTilt: `1,${pan},${tilt}`,
				})
			},
		},
	}

	ptz = {
		move: async (direction: PtzDirection, panSpeed: number, tiltSpeed: number): Promise<void> =>
			this.exec('command/ptzf.cgi', {
				PanTiltMove: `${direction},${clampInt(panSpeed, 0, MAX_PT_SPEED)},${clampInt(tiltSpeed, 0, MAX_PT_SPEED)}`,
			}),
		zoom: async (direction: ZoomDirection, speed: number): Promise<void> =>
			this.exec('command/ptzf.cgi', { ZoomMove: `${direction},${clampInt(speed, 0, MAX_ZOOM_SPEED)}` }),
		stop: async (target: StopTarget): Promise<void> => {
			const params: Record<StopTarget, PtzCommandParams> = {
				pantilt: { PanTiltMove: 'stop,0,0' },
				zoom: { ZoomMove: 'stop,0' },
				focus: { Move: 'stop,focus' },
				motor: { Move: 'stop,motor' },
			}
			return this.exec('command/ptzf.cgi', params[target])
		},
		reset: async (): Promise<void> => this.exec('command/ptzf.cgi', { PanTiltReset: 'on' }),
		absolutePTZF: async (pan: number, tilt: number, zoom: number, focus: number): Promise<void> =>
			this.exec('command/ptzf.cgi', {
				AbsolutePTZF: `${to16(pan)},${to16(tilt)},${to16(zoom)},${to16(focus)}`,
			}),
	}

	focus = {
		setMode: async (mode: FocusMode): Promise<void> => this.exec('command/ptzf.cgi', { FocusMode: mode }),
		setAFMode: async (mode: AFMode): Promise<void> => this.exec('command/ptzf.cgi', { AFMode: mode }),
		setAFSensitivity: async (sensitivity: AFSensitivity): Promise<void> =>
			this.exec('command/ptzf.cgi', { AFSensitivity: sensitivity }),
	}

	preset = {
		call: async (num: number): Promise<void> => this.exec('command/presetposition.cgi', { PresetCall: num.toString() }),
		set: async (num: number): Promise<void> =>
			this.exec('command/presetposition.cgi', { PresetSet: `${num},Preset${num},on` }),
		home: async (): Promise<void> => this.exec('command/presetposition.cgi', { HomePos: 'recall' }),
		lookBack: async (): Promise<void> => this.exec('command/ptzf.cgi', { AbsolutePanTilt: '2200,0,24' }),
	}

	sceneFile = {
		recall: async (num: number): Promise<void> =>
			this.exec('command/scenefile.cgi', { SceneFileCurrentSceneFile: num.toString() }),
	}

	// ---- Inquiries (parsed once into typed fragments) -----------------------

	query = {
		sysInfo: async (): Promise<SysInfoStatus> => {
			const p = await this.transport.sendInq({ inq: 'sysinfo' })
			return {
				power: p.get('Power') || '',
				name: p.get('NetworkCameraName') || '',
				serial: p.get('Serial') || '',
				softVersion: p.get('SoftVersion') || '',
			}
		},
		system: async (): Promise<SystemStatus> => {
			const p = await this.transport.sendInq({ inq: 'system' })
			return {
				modelName: p.get('ModelName') || '',
				power: p.get('Power') || '',
				serial: p.get('Serial') || '',
				softVersion: p.get('SoftVersion') || '',
			}
		},
		autoFraming: async (): Promise<AutoFramingStatus> =>
			parseAutoFraming(await this.transport.sendInq({ inq: 'ptzautoframing' })),
		ptzf: async (): Promise<PtzfStatus> => parsePtzf(await this.transport.sendInq({ inq: 'ptzf' })),
		stream: async (): Promise<StreamStatus> => {
			const p = await this.transport.sendInq({ inq: 'stream' })
			return { streamMode: p.get('StreamMode') || '' }
		},
		sceneFile: async (): Promise<SceneFileStatus> => parseSceneFile(await this.transport.sendInq({ inq: 'scenefile' })),
		imaging: async (): Promise<ImagingStatus> => {
			const p = await this.transport.sendInq({ inq: 'imaging' })
			return {
				exposureGain: Number(p.get('ExposureGain')) || 0,
				exposureIris: Number(p.get('ExposureIris')) || 0,
				exposureNDVariable: Number(p.get('ExposureNDVariable')) || 0,
			}
		},
		paint: async (): Promise<PaintStatus> => {
			const p = await this.transport.sendInq({ inq: 'paint' })
			return { masterBlack: Number(p.get('MasterBlack')) || 0 }
		},
	}
}

// Parsers kept module-level (pure) so they can be unit tested independently of the transport.

export function parseAutoFraming(p: URLSearchParams): AutoFramingStatus {
	const axisValue = (prefix: string): Record<Axis, string | undefined> => ({
		Pan: p.get(`${prefix}Pan`) || undefined,
		Tilt: p.get(`${prefix}Tilt`) || undefined,
		Zoom: p.get(`${prefix}Zoom`) || undefined,
	})
	const leadRaw = p.get('PtzAutoFramingLeadRoomLevel') || ''
	return {
		autoFraming: p.get('PtzAutoFraming') || '',
		framingMode: p.get('PtzAutoFramingFramingMode') || '',
		// AdjustSetting inquiry returns "<pan>,<tilt>,<zoom>"; the shot mode is the 3rd field
		shotMode: (p.get('PtzAutoFramingAdjustSetting') || '').split(',')[2] || '',
		leadRoom: LEAD_ROOM_NAMES[leadRaw.toLowerCase()] || leadRaw || '',
		realtimeOverlay: p.get('PtzAutoFramingFaceIndicatorEnable3') || '',
		// FixedAngleEnable inquiry returns "<number>,<on|off>"; the enabled state is the 2nd field
		fixedAngle: (p.get('PtzAutoFramingFixedAngleEnable') || '').split(',')[1] || '',
		trackingStatus: p.get('PtzAutoFramingTrackingStatus') || '',
		trackingSpeed: axisValue('PtzAutoFramingSpeed'),
		trackingSensitivity: axisValue('PtzAutoFramingSensitivity'),
		multiTracking: p.get('PtzAutoFramingMultiTrackingEnable') || undefined,
		multiTrackingTargetNum: p.get('PtzAutoFramingMultiTrackingTargetNum') || undefined,
		multiTrackingNum: p.get('PtzAutoFramingMultiTrackingCurrentTargetNum') || '',
	}
}

export function parsePtzf(p: URLSearchParams): PtzfStatus {
	const [pan = 0, tilt = 0, zoom = 0, focus = 0] = splitInt16Array(p.get('AbsolutePTZF') || '')
	const [panRangeLeft = 0, panRangeRight = 0] = splitInt16Array(p.get('PanMovementRange') || '')
	const [tiltRangeLower = 0, tiltRangeUpper = 0] = splitInt16Array(p.get('TiltMovementRange') || '')
	const [zoomRangeWide = 0, zoomRangeTele = 0] = splitInt16Array(p.get('ZoomMovementRange') || '')
	return {
		pan,
		tilt,
		zoom,
		focus,
		panRangeLeft,
		panRangeRight,
		tiltRangeLower,
		tiltRangeUpper,
		zoomRangeWide,
		zoomRangeTele,
		focusMode: p.get('FocusMode') || undefined,
		afSensitivity: p.get('AFSensitivity') || undefined,
		afMode: p.get('AFMode') || undefined,
		zoomMode: p.get('ZoomMode') || '',
		absoluteFocus: p.get('AbsoluteFocus') || '',
	}
}

// SceneFileList value is CSV in groups of 3: fileNumber, base64Name, exportable
export function parseSceneFile(p: URLSearchParams): SceneFileStatus {
	const names: Record<string, string> = Object.fromEntries(
		Array.from({ length: 16 }, (_, i) => [`sceneFileName${i + 1}`, 'None']),
	)
	const parts = (p.get('SceneFileList') ?? '').split(',')
	for (let i = 0; i + 2 < parts.length; i += 3) {
		const fileNum = parseInt(parts[i], 10)
		const name = Buffer.from(parts[i + 1], 'base64').toString('utf8')
		if (fileNum >= 1 && fileNum <= 16) {
			names[`sceneFileName${fileNum}`] = name
		}
	}
	return { currentSceneFile: p.get('SceneFileCurrentSceneFile') ?? undefined, names }
}
