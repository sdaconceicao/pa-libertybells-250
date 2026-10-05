import type { Bell } from "../../../lib/bells/types";

export const LANDING_OVERLAY_DISMISS_KEY = "pa-bells-landing-dismissed";

export const FEATURED_BELL_IDS = [
	"washington-the-american-spirit",
	"butler-the-butler-bell",
	"allegheny-pittsburgh-s-250-bell",
] as const;

export const LANDING_STEPS = [
	{
		number: 1,
		title: "Explore",
		description:
			"Find bells across Pennsylvania by county, location, or distance.",
	},
	{
		number: 2,
		title: "Visit",
		description:
			"See them in person and discover the stories behind each bell.",
	},
	{
		number: 3,
		title: "Collect",
		description:
			"Track the bells you've visited and save the ones you want to see.",
	},
] as const;

export function selectFeaturedBells(
	bells: Bell[],
	ids: readonly string[] = FEATURED_BELL_IDS,
): Bell[] {
	const byId = new Map(bells.map((bell) => [bell.id, bell]));
	return ids.flatMap((id) => {
		const bell = byId.get(id);
		return bell ? [bell] : [];
	});
}

export function getLandingOverlayStorage(): Pick<
	Storage,
	"getItem" | "setItem"
> | null {
	if (typeof window === "undefined") {
		return null;
	}

	return window.sessionStorage;
}

export function readLandingOverlayDismissed(
	storage: Pick<Storage, "getItem"> | null,
): boolean {
	if (!storage) {
		return false;
	}

	return storage.getItem(LANDING_OVERLAY_DISMISS_KEY) === "1";
}

export function writeLandingOverlayDismissed(
	storage: Pick<Storage, "setItem"> | null,
): void {
	if (!storage) {
		return;
	}

	storage.setItem(LANDING_OVERLAY_DISMISS_KEY, "1");
}
