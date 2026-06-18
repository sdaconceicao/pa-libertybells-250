/**
 * A user's relationship to a bell location.
 *
 * - `none` — no saved status (the default for every bell)
 * - `want` — the user wants to go
 * - `been` — the user has been there
 *
 * Saved states are stored in the `visited` table; only one status per bell.
 */
export type VisitStatus = "none" | "want" | "been";

/** A status persisted in the database (excludes `none`). */
export type SavedVisitStatus = Exclude<VisitStatus, "none">;

/** Map of bellId → saved status for the current user. */
export type VisitStatusMap = Record<string, SavedVisitStatus>;

export function isVisitStatus(value: unknown): value is VisitStatus {
	return value === "none" || value === "want" || value === "been";
}

export function isSavedVisitStatus(value: unknown): value is SavedVisitStatus {
	return value === "want" || value === "been";
}
