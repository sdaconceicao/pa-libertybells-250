import type { VisitStatus } from "../../../../../lib/visits/types";
import bellMarkerSvg from "./bell-marker.svg?raw";
import styles from "./Marker.module.css";

const MARKER_WIDTH = 32;
export const BELL_MARKER_HEIGHT = 40;

const STATUS_CLASS: Record<VisitStatus, string> = {
	none: "",
	want: styles.bellMarkerWant,
	been: styles.bellMarkerBeen,
};

export function createBellMarkerElement(
	status: VisitStatus = "none",
): HTMLButtonElement {
	const element = document.createElement("button");
	element.type = "button";
	element.className = [styles.bellMarker, STATUS_CLASS[status]]
		.filter(Boolean)
		.join(" ");
	element.style.width = `${MARKER_WIDTH}px`;
	element.style.height = `${BELL_MARKER_HEIGHT}px`;
	element.innerHTML = bellMarkerSvg;
	return element;
}
