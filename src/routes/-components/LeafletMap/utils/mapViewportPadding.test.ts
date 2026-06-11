import { describe, expect, it, vi } from "vitest";
import type { Map as LeafletMapInstance } from "leaflet";
import {
	applyMapViewportPaddingOffset,
	getFitBoundsPadding,
	getMapCenterForVisibleLatLng,
	getMapCenterOffset,
	getMapViewportPadding,
	getSidebarWidthPx,
	getVisibleCenterContainerPoint,
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

		expect(padding.bottom).toBe(48);
		expect(padding.left).toBe(16);
	});

	it("uses symmetric top padding without a header", () => {
		const padding = getMapViewportPadding({
			sidebarOpen: false,
			isMobile: false,
			viewportWidth: 1280,
		});

		expect(padding.top).toBe(16);
		expect(padding.bottom).toBe(16);
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

	it("has no vertical offset when top and bottom padding match", () => {
		expect(
			getMapCenterOffset({
				top: 16,
				right: 16,
				bottom: 16,
				left: 384,
			}),
		).toEqual([184, 0]);
	});
});

describe("getVisibleCenterContainerPoint", () => {
	it("returns the center of the visible map area when left padding is larger", () => {
		expect(
			getVisibleCenterContainerPoint(
				{
					top: 16,
					right: 16,
					bottom: 16,
					left: 384,
				},
				{ x: 1280, y: 800 },
			),
		).toEqual([824, 400]);
	});
});

describe("getMapCenterForVisibleLatLng", () => {
	const mapSize = { x: 1280, y: 800 };
	const mockMap = {
		getSize: () => mapSize,
		project: ([lat, lng]: [number, number], _zoom?: number) => ({
			x: lng * 1000,
			y: lat * 1000,
		}),
		unproject: (point: [number, number], _zoom?: number) => ({
			lat: point[1] / 1000,
			lng: point[0] / 1000,
		}),
	} as Pick<LeafletMapInstance, "project" | "unproject" | "getSize">;

	it("returns the target when padding is symmetric", () => {
		const latLng: [number, number] = [40.5, -77.5];

		expect(
			getMapCenterForVisibleLatLng(mockMap, latLng, 14, {
				top: 16,
				right: 16,
				bottom: 16,
				left: 16,
			}),
		).toEqual(latLng);
	});

	it("returns a center that places the target at the visible center", () => {
		const latLng: [number, number] = [40.5, -77.5];
		const padding = {
			top: 16,
			right: 16,
			bottom: 16,
			left: 384,
		};
		const center = getMapCenterForVisibleLatLng(mockMap, latLng, 14, padding);
		const [offsetX, offsetY] = getMapCenterOffset(padding);
		const targetPoint = mockMap.project(latLng, 14);
		const centerPoint = mockMap.project(center, 14);

		expect(targetPoint.x - centerPoint.x + mapSize.x / 2).toBeCloseTo(
			mapSize.x / 2 + offsetX,
		);
		expect(targetPoint.y - centerPoint.y + mapSize.y / 2).toBeCloseTo(
			mapSize.y / 2 + offsetY,
		);
	});
});

describe("applyMapViewportPaddingOffset", () => {
	it("pans the map by the inverse of the center offset", () => {
		const panBy = vi.fn();

		applyMapViewportPaddingOffset(
			{ panBy },
			{
				top: 16,
				right: 16,
				bottom: 16,
				left: 384,
			},
		);

		expect(panBy).toHaveBeenCalledTimes(1);
		expect(panBy.mock.calls[0]?.[0]).toEqual([-184, 0]);
		expect(panBy.mock.calls[0]?.[1]).toEqual({ animate: false });
	});

	it("does nothing when padding is symmetric", () => {
		const panBy = vi.fn();

		applyMapViewportPaddingOffset(
			{ panBy },
			{
				top: 16,
				right: 16,
				bottom: 16,
				left: 16,
			},
		);

		expect(panBy).not.toHaveBeenCalled();
	});
});

describe("getFitBoundsPadding", () => {
	it("maps padding to Leaflet [x, y] point order", () => {
		expect(
			getFitBoundsPadding({
				top: 16,
				right: 24,
				bottom: 72,
				left: 368,
			}),
		).toEqual({
			paddingTopLeft: [368, 16],
			paddingBottomRight: [24, 72],
		});
	});
});
