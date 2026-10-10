import { describe, expect, it } from "vitest";
import { isMovingToElement } from "./isMovingToElement";

describe("isMovingToElement", () => {
	it("recognizes the container and its descendants", () => {
		const container = document.createElement("div");
		const child = document.createElement("span");
		container.append(child);
		expect(isMovingToElement(container, container)).toBe(true);
		expect(isMovingToElement(child, container)).toBe(true);
	});

	it("rejects outside, missing, and non-node targets", () => {
		const container = document.createElement("div");
		expect(isMovingToElement(document.createElement("span"), container)).toBe(
			false,
		);
		expect(isMovingToElement(null, container)).toBe(false);
		expect(isMovingToElement(new EventTarget(), container)).toBe(false);
		expect(isMovingToElement(container, undefined)).toBe(false);
	});
});
