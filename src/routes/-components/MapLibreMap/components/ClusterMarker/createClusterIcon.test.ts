import { describe, expect, it } from "vitest";
import {
	buildClusterIconHtml,
	getClusterIconDimensions,
	getClusterSizeClass,
	getClusterTier,
} from "./createClusterIcon";

describe("cluster icon helpers", () => {
	it("uses each size tier at its boundary", () => {
		expect([1, 9, 10, 49, 50].map(getClusterTier)).toEqual([
			"small",
			"small",
			"medium",
			"medium",
			"large",
		]);
	});

	it("keeps icon dimensions and count centered for each tier", () => {
		const tiers = ["small", "medium", "large"] as const;
		const heights = tiers.map(
			(tier) => getClusterIconDimensions(tier).iconSize[1],
		);
		expect(heights).toEqual([45, 52, 60]);
		for (const tier of tiers) {
			const { iconSize, iconAnchor } = getClusterIconDimensions(tier);
			expect(iconSize[0]).toBeGreaterThan(iconSize[1]);
			expect(iconAnchor[0]).toBeGreaterThan(0);
			expect(iconAnchor[1]).toBeLessThan(iconSize[1]);
			expect(getClusterSizeClass(tier)).toBeTruthy();
		}
	});

	it("renders the cluster count without making it a second accessible label", () => {
		const element = document.createElement("div");
		element.innerHTML = buildClusterIconHtml(12);
		expect(element.querySelector('[aria-hidden="true"]')?.textContent).toBe(
			"12",
		);
		expect(element.querySelector("svg")).not.toBeNull();
	});
});
