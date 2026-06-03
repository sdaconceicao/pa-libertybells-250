import type * as Leaflet from "leaflet";
import type { MarkerCluster } from "leaflet.markercluster";
import styles from "./LeafletMap.module.css";

const CLUSTER_ICON_SIZE = 44;

function getClusterSizeClass(count: number): string {
	if (count < 10) {
		return styles.clusterSmall;
	}
	if (count < 50) {
		return styles.clusterMedium;
	}
	return styles.clusterLarge;
}

export function createClusterIconFactory(L: typeof Leaflet) {
	return (cluster: MarkerCluster) => {
		const count = cluster.getChildCount();
		const sizeClass = getClusterSizeClass(count);

		return L.divIcon({
			html: `<span aria-hidden="true">${count}</span>`,
			className: `${styles.bellCluster} ${sizeClass}`,
			iconSize: [CLUSTER_ICON_SIZE, CLUSTER_ICON_SIZE],
			iconAnchor: [CLUSTER_ICON_SIZE / 2, CLUSTER_ICON_SIZE / 2],
		});
	};
}
