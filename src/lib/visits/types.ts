/**
 * A user's relationship to a bell location.
 *
 * - `none` — no saved status (the default for every bell)
 * - `want` — the user wants to go (stored in the `favorite` table)
 * - `been` — the user has been there (stored in the `been_to` table)
 *
 * The two saved states are mutually exclusive: choosing one clears the other.
 */
export type VisitStatus = "none" | "want" | "been";

/** Map of bellId → saved status for the current user. */
export type VisitStatusMap = Record<string, Exclude<VisitStatus, "none">>;

export function isVisitStatus(value: unknown): value is VisitStatus {
	return value === "none" || value === "want" || value === "been";
}
