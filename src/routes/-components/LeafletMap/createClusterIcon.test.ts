import { describe, expect, it } from "vitest";
import type * as Leaflet from "leaflet";
import { createClusterIconFactory } from "./createClusterIcon";
import styles from "./LeafletMap.module.css";

describe("createClusterIconFactory", () => {
	const L = {
		divIcon: (options: Leaflet.DivIconOptions) => options,
	} as unknown as typeof Leaflet;

	it("uses larger cluster styles as the child count grows", () => {
		const createIcon = createClusterIconFactory(L);

		expect(
			createIcon({ getChildCount: () => 3 } as never).className,
		).toContain(styles.clusterSmall);
		expect(
			createIcon({ getChildCount: () => 25 } as never).className,
		).toContain(styles.clusterMedium);
		expect(
			createIcon({ getChildCount: () => 80 } as never).className,
		).toContain(styles.clusterLarge);
	});
});
