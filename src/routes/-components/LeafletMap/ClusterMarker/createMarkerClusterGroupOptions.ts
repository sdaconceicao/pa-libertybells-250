import type * as Leaflet from "leaflet";
import { createClusterIconFactory } from "./createClusterIcon";

/** Zoom level at which individual bell markers are shown instead of clusters. */
export const CLUSTER_DISABLE_ZOOM = 14;

export function createMarkerClusterGroupOptions(
	L: typeof Leaflet,
): Leaflet.MarkerClusterGroupOptions {
	return {
		chunkedLoading: true,
		maxClusterRadius: 56,
		disableClusteringAtZoom: CLUSTER_DISABLE_ZOOM,
		spiderfyOnMaxZoom: true,
		showCoverageOnHover: false,
		zoomToBoundsOnClick: true,
		removeOutsideVisibleBounds: true,
		iconCreateFunction: createClusterIconFactory(L),
	};
}
