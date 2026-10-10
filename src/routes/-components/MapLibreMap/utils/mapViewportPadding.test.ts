import { describe, expect, it } from "vitest";
import {
	getMapCenterOffset,
	getMapViewportPadding,
} from "./mapViewportPadding";

describe("mapViewportPadding", () => {
	it("uses equal desktop edges and a larger mobile bottom inset", () => {
		expect(
			getMapViewportPadding({ isMobile: false, rootFontSize: 18 }),
		).toEqual({
			top: 18,
			right: 18,
			bottom: 18,
			left: 18,
		});
		expect(getMapViewportPadding({ isMobile: true, rootFontSize: 18 })).toEqual(
			{
				top: 18,
				right: 18,
				bottom: 48,
				left: 18,
			},
		);
	});

	it("centers within asymmetric padding", () => {
		expect(
			getMapCenterOffset({ top: 12, right: 30, bottom: 52, left: 10 }),
		).toEqual([-10, -20]);
	});
});
