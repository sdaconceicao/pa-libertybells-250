import { describe, expect, it } from "vitest";
import type { Bell } from "../../../lib/bells/types";
import {
	FEATURED_BELL_IDS,
	LANDING_OVERLAY_DISMISS_KEY,
	getLandingOverlayStorage,
	readLandingOverlayDismissed,
	selectFeaturedBells,
	writeLandingOverlayDismissed,
} from "./LandingOverlay.utils";

function makeBell(id: string, title: string): Bell {
	return {
		id,
		county: "York",
		title,
		address: { city: "York", zip: "17401" },
		sourceSlug: id,
		lat: 40,
		lng: -77,
	};
}

describe("selectFeaturedBells", () => {
	it("returns bells in the featured id order", () => {
		const bells = [
			makeBell("allegheny-pittsburgh-s-250-bell", "Pittsburgh's 250 Bell"),
			makeBell("other", "Other"),
			makeBell("butler-the-butler-bell", "The Butler Bell"),
			makeBell("washington-the-american-spirit", "The American Spirit"),
		];

		expect(selectFeaturedBells(bells).map((bell) => bell.id)).toEqual([
			...FEATURED_BELL_IDS,
		]);
	});

	it("skips ids that are missing from the list", () => {
		const bells = [makeBell("butler-the-butler-bell", "The Butler Bell")];

		expect(selectFeaturedBells(bells).map((bell) => bell.id)).toEqual([
			"butler-the-butler-bell",
		]);
	});

	it("returns an empty list when none of the ids match", () => {
		expect(selectFeaturedBells([makeBell("other", "Other")])).toEqual([]);
	});
});

describe("landing overlay storage", () => {
	it("returns null storage when window is unavailable", () => {
		const originalWindow = globalThis.window;

		// @ts-expect-error simulate SSR
		delete globalThis.window;

		expect(getLandingOverlayStorage()).toBeNull();
		expect(readLandingOverlayDismissed(null)).toBe(false);
		expect(() => writeLandingOverlayDismissed(null)).not.toThrow();

		globalThis.window = originalWindow;
	});

	it("reads and writes the dismissed flag", () => {
		const store = new Map<string, string>();
		const storage = {
			getItem: (key: string) => store.get(key) ?? null,
			setItem: (key: string, value: string) => {
				store.set(key, value);
			},
		};

		expect(readLandingOverlayDismissed(storage)).toBe(false);

		writeLandingOverlayDismissed(storage);

		expect(store.get(LANDING_OVERLAY_DISMISS_KEY)).toBe("1");
		expect(readLandingOverlayDismissed(storage)).toBe(true);
	});

	it("uses sessionStorage in the browser", () => {
		sessionStorage.clear();

		const storage = getLandingOverlayStorage();
		expect(storage).toBe(window.sessionStorage);

		writeLandingOverlayDismissed(storage);
		expect(sessionStorage.getItem(LANDING_OVERLAY_DISMISS_KEY)).toBe("1");

		sessionStorage.clear();
	});
});
