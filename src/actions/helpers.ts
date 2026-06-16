import type { InputValue } from '@companion-module/base'

/** Resolve a (possibly variable-backed) numeric option to a number, falling back when unparseable. */
export function resolveNumber(raw: InputValue | undefined, fallback: number): number {
	const parsed = Math.round(Number(Array.isArray(raw) ? NaN : (raw ?? '')))
	return Number.isFinite(parsed) ? parsed : fallback
}
