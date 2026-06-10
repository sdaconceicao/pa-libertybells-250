import { describe, expect, it } from "vitest";
import type * as Leaflet from "leaflet";
import {
	buildClusterIconHtml,
	createClusterIconFactory,
	getClusterIconDimensions,
	getClusterTier,
} from "./createClusterIcon";
import styles from "./ClusterMarker.module.css";

describe("getClusterTier", () => {
	it("maps child counts to size tiers", () => {
		expect(getClusterTier(3)).toBe("small");
		expect(getClusterTier(25)).toBe("medium");
		expect(getClusterTier(80)).toBe("large");
	});
});

describe("getClusterIconDimensions", () => {
	it("returns tiered dimensions anchored on the count circle", () => {
		expect(getClusterIconDimensions("small")).toEqual({
			iconSize: [72, 45],
			iconAnchor: [36.242, 25],
		});
		expect(getClusterIconDimensions("medium")).toEqual({
			iconSize: [84, 52],
			iconAnchor: [42.282, 28.889],
		});
		expect(getClusterIconDimensions("large")).toEqual({
			iconSize: [96, 60],
			iconAnchor: [48.323, 33.333],
		});
	});
});

describe("buildClusterIconHtml", () => {
	it("embeds the cluster artwork and count", () => {
		const html = buildClusterIconHtml(12);

		expect(html).toContain('viewBox="0 0 520.5');
		expect(html).toContain('aria-hidden="true">12</span>');
		expect(html).toContain(styles.clusterMarker);
		expect(html).toContain(styles.clusterCount);
	});
});

describe("createClusterIconFactory", () => {
	const L = {
		divIcon: (options: Leaflet.DivIconOptions): Leaflet.DivIconOptions =>
			options,
	} as unknown as typeof Leaflet;

	const createIcon = (count: number): Leaflet.DivIconOptions =>
		createClusterIconFactory(L)({
			getChildCount: () => count,
		} as Leaflet.MarkerCluster) as Leaflet.DivIconOptions;

	it("uses larger cluster styles as the child count grows", () => {
		expect(createIcon(3).className).toContain(styles.clusterSmall);
		expect(createIcon(25).className).toContain(styles.clusterMedium);
		expect(createIcon(80).className).toContain(styles.clusterLarge);
	});

	it("includes cluster svg markup and tiered icon dimensions", () => {
		const icon = createIcon(25);

		expect(icon.html).toContain('viewBox="0 0 520.5');
		expect(icon.html).toContain('aria-hidden="true">25</span>');
		expect(icon.iconSize).toEqual([84, 52]);
		expect(icon.iconAnchor).toEqual([42.282, 28.889]);
	});
});
