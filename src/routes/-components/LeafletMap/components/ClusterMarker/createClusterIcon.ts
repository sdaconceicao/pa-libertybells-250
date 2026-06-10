import type * as Leaflet from "leaflet";

import clusterSvg from "./cluster.svg?raw";
import styles from "./ClusterMarker.module.css";

const CLUSTER_VIEWBOX_ASPECT = 520.5 / 324;
const COUNT_CENTER_X = 262 / 520.5;
const COUNT_CENTER_Y = 180 / 324;

const CLUSTER_HEIGHT_BY_TIER = {
	small: 45,
	medium: 52,
	large: 60,
} as const;

export type ClusterTier = keyof typeof CLUSTER_HEIGHT_BY_TIER;

export function getClusterTier(count: number): ClusterTier {
	if (count < 10) {
		return "small";
	}
	if (count < 50) {
		return "medium";
	}
	return "large";
}

export function getClusterSizeClass(tier: ClusterTier): string {
	switch (tier) {
		case "small":
			return styles.clusterSmall;
		case "medium":
			return styles.clusterMedium;
		case "large":
			return styles.clusterLarge;
	}
}

export function getClusterIconDimensions(tier: ClusterTier): {
	iconSize: [number, number];
	iconAnchor: [number, number];
} {
	const height = CLUSTER_HEIGHT_BY_TIER[tier];
	const width = Math.round(height * CLUSTER_VIEWBOX_ASPECT);

	return {
		iconSize: [width, height],
		iconAnchor: [
			Math.round(width * COUNT_CENTER_X * 1000) / 1000,
			Math.round(height * COUNT_CENTER_Y * 1000) / 1000,
		],
	};
}

export function buildClusterIconHtml(count: number): string {
	return `<div class="${styles.clusterMarker}">${clusterSvg}<span class="${styles.clusterCount}" aria-hidden="true">${count}</span></div>`;
}

export function createClusterIconFactory(L: typeof Leaflet) {
	return (cluster: Leaflet.MarkerCluster) => {
		const count = cluster.getChildCount();
		const tier = getClusterTier(count);
		const sizeClass = getClusterSizeClass(tier);
		const { iconSize, iconAnchor } = getClusterIconDimensions(tier);

		return L.divIcon({
			html: buildClusterIconHtml(count),
			className: `${styles.bellCluster} ${sizeClass}`,
			iconSize,
			iconAnchor,
		});
	};
}
