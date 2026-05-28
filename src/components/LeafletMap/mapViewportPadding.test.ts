import { describe, expect, it } from "vitest";
import {
	getMapCenterOffset,
	getMapViewportPadding,
	getSidebarWidthPx,
} from "./mapViewportPadding";

describe("getSidebarWidthPx", () => {
	it("uses the configured sidebar width on wide viewports", () => {
		expect(getSidebarWidthPx(1280)).toBe(352);
	});

	it("caps sidebar width on narrow viewports", () => {
		expect(getSidebarWidthPx(360)).toBe(328);
	});
});

describe("getMapViewportPadding", () => {
	it("adds left padding when the sidebar is open on desktop", () => {
		const padding = getMapViewportPadding({
			sidebarOpen: true,
			isMobile: false,
			viewportWidth: 1280,
		});

		expect(padding.left).toBeGreaterThan(padding.right);
		expect(padding.left).toBe(352 + 16);
	});

	it("uses a narrow left padding when the sidebar is closed", () => {
		const padding = getMapViewportPadding({
			sidebarOpen: false,
			isMobile: false,
			viewportWidth: 1280,
		});

		expect(padding.left).toBe(20);
	});

	it("reserves space for the mobile toggle bar", () => {
		const padding = getMapViewportPadding({
			sidebarOpen: false,
			isMobile: true,
			viewportWidth: 390,
		});

		expect(padding.bottom).toBe(72);
		expect(padding.left).toBe(16);
	});
});

describe("getMapCenterOffset", () => {
	it("shifts the center right when left padding is larger", () => {
		expect(
			getMapCenterOffset({
				top: 80,
				right: 16,
				bottom: 16,
				left: 384,
			}),
		).toEqual([184, 32]);
	});
});
