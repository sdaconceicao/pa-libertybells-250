import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Bell } from "../../../lib/bells/types";
import { BellsList } from "./BellsList";

function makeBell(id: string, title: string): Bell {
	return {
		id,
		county: "York",
		title,
		address: { city: "York", zip: "17401" },
		sourceSlug: id,
		lat: 40,
		lng: -77,
	};
}

describe("BellsList", () => {
	beforeEach(() => {
		Object.defineProperty(HTMLElement.prototype, "clientHeight", {
			configurable: true,
			value: 400,
		});
		Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
			configurable: true,
			value: 400,
		});
		Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
			configurable: true,
			value: 400,
		});
		Element.prototype.getBoundingClientRect = () =>
			({
				width: 300,
				height: 400,
				top: 0,
				left: 0,
				right: 300,
				bottom: 400,
				x: 0,
				y: 0,
				toJSON: () => ({}),
			}) as DOMRect;
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it("renders the empty message when there are no bells", () => {
		render(<BellsList bells={[]} emptyMessage="Nothing here" />);

		expect(screen.getByText("Nothing here")).toBeTruthy();
	});

	it("renders visible bell entries from the virtualized list", () => {
		const bells = Array.from({ length: 20 }, (_, index) =>
			makeBell(`bell-${index}`, `Bell ${index}`),
		);

		render(<BellsList bells={bells} />);

		expect(screen.getByText("Bell 0")).toBeTruthy();
		expect(screen.queryByText("Bell 19")).toBeNull();
	});
});
