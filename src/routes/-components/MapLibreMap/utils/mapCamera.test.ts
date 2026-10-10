import type { Map as MapInstance } from "maplibre-gl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Bell } from "../../../../lib/bells/types";
import {
	fitBells,
	fitPennsylvania,
	PA_ZOOM_BOUNDS,
	setPennsylvaniaZoomLimit,
	viewportPadding,
} from "./mapCamera";

const padding = { top: 16, right: 16, bottom: 16, left: 16 };

function bell(id: string, lat: number, lng: number): Bell {
	return {
		id,
		county: "Test",
		title: id,
		lat,
		lng,
		sourceSlug: "test",
		address: { street: "Main St", city: "Test", zip: "12345" },
	};
}

function mockMap() {
	const container = document.createElement("div");
	const map = {
		resize: vi.fn(),
		easeTo: vi.fn(),
		fitBounds: vi.fn(),
		cameraForBounds: vi.fn().mockReturnValue({ zoom: 6.75 }),
		setMinZoom: vi.fn(),
		getMinZoom: vi.fn().mockReturnValue(6.75),
		getContainer: vi.fn().mockReturnValue(container),
	};
	return { map: map as unknown as MapInstance, methods: map, container };
}

describe("mapCamera", () => {
	beforeEach(() => {
		document.documentElement.style.fontSize = "16px";
	});

	it("uses the root font size and leaves room for mobile controls", () => {
		document.documentElement.style.fontSize = "20px";
		expect(viewportPadding(false)).toEqual({
			top: 20,
			right: 20,
			bottom: 20,
			left: 20,
		});
		expect(viewportPadding(true)).toEqual({
			top: 20,
			right: 20,
			bottom: 48,
			left: 20,
		});
	});

	it("sets the minimum zoom from Pennsylvania bounds", () => {
		const { map, methods, container } = mockMap();
		setPennsylvaniaZoomLimit(map, false);
		expect(methods.cameraForBounds).toHaveBeenCalledWith(PA_ZOOM_BOUNDS, {
			padding,
		});
		expect(methods.setMinZoom).toHaveBeenCalledWith(6.75);
		expect(container.dataset.mapMinZoom).toBe("6.75");
	});

	it("does not change the zoom when bounds cannot fit", () => {
		const { map, methods } = mockMap();
		methods.cameraForBounds.mockReturnValue(undefined);
		setPennsylvaniaZoomLimit(map, false);
		expect(methods.setMinZoom).not.toHaveBeenCalled();
	});

	it("fits the full state on opening", () => {
		const { map, methods } = mockMap();
		fitPennsylvania(map, false);
		expect(methods.fitBounds).toHaveBeenCalledWith(PA_ZOOM_BOUNDS, {
			padding,
			duration: 0,
		});
	});

	it("frames zero, one, and multiple filtered bells", () => {
		const { map, methods } = mockMap();
		fitBells(map, [], padding);
		expect(methods.easeTo).toHaveBeenLastCalledWith({
			center: [-77.79, 40.87],
			zoom: 7,
			offset: [0, 0],
			duration: 0,
		});
		fitBells(map, [bell("a", 40, -77)], padding);
		expect(methods.easeTo).toHaveBeenLastCalledWith({
			center: [-77, 40],
			zoom: 12,
			offset: [0, 0],
			duration: 0,
		});
		fitBells(map, [bell("a", 40, -80), bell("b", 42, -75)], padding);
		expect(methods.fitBounds).toHaveBeenLastCalledWith(
			[
				[-80, 40],
				[-75, 42],
			],
			{ padding, maxZoom: 13, duration: 0 },
		);
		expect(methods.resize).toHaveBeenCalledTimes(3);
	});
});
