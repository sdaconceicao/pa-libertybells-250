import type * as Leaflet from "leaflet";
import type { VisitStatus } from "../../../../../lib/visits/types";
import bellMarkerSvg from "./bell-marker.svg?raw";
import styles from "./Marker.module.css";

const MARKER_WIDTH = 32;
const MARKER_HEIGHT = 40;

const STATUS_CLASS: Record<VisitStatus, string> = {
	none: "",
	want: styles.bellMarkerWant,
	been: styles.bellMarkerBeen,
};

export function createBellMarkerIcon(
	L: typeof Leaflet,
	status: VisitStatus = "none",
): Leaflet.DivIcon {
	const className = [styles.bellMarker, STATUS_CLASS[status]]
		.filter(Boolean)
		.join(" ");

	return L.divIcon({
		className,
		html: bellMarkerSvg,
		iconSize: [MARKER_WIDTH, MARKER_HEIGHT],
		iconAnchor: [MARKER_WIDTH / 2, MARKER_HEIGHT],
		popupAnchor: [0, -MARKER_HEIGHT],
	});
}
