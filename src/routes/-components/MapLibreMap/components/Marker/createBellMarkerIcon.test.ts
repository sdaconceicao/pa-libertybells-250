import { describe, expect, it } from "vitest";
import {
	BELL_MARKER_HEIGHT,
	createBellMarkerElement,
} from "./createBellMarkerIcon";

describe("createBellMarkerElement", () => {
	it("creates a consistent, clickable bell marker", () => {
		const marker = createBellMarkerElement();
		expect(marker.tagName).toBe("BUTTON");
		expect(marker.type).toBe("button");
		expect(marker.style.width).toBe("32px");
		expect(marker.style.height).toBe(`${BELL_MARKER_HEIGHT}px`);
		expect(marker.querySelector("svg")).not.toBeNull();
	});

	it("distinguishes wanted and visited markers", () => {
		const plain = createBellMarkerElement("none");
		const wanted = createBellMarkerElement("want");
		const visited = createBellMarkerElement("been");
		expect(wanted.className).not.toBe(plain.className);
		expect(visited.className).not.toBe(plain.className);
		expect(visited.className).not.toBe(wanted.className);
	});
});
