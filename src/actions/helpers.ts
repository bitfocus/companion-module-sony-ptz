import type { InputValue } from '@companion-module/base'

/** Resolve a (possibly variable-backed) speed option to a number, falling back when unparseable. */
export function resolveSpeed(raw: InputValue | undefined, fallback: number): number {
	const parsed = Math.round(Number(Array.isArray(raw) ? NaN : (raw ?? '')))
	return Number.isFinite(parsed) ? parsed : fallback
}
