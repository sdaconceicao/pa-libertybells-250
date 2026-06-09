import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
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
	afterEach(() => {
		cleanup();
	});

	it("renders the empty message when there are no bells", () => {
		render(<BellsList bells={[]} emptyMessage="Nothing here" />);

		expect(screen.getByText("Nothing here")).toBeTruthy();
	});

	it("renders bell entries", () => {
		const bells = [
			makeBell("bell-0", "Bell 0"),
			makeBell("bell-1", "Bell 1"),
		];

		render(<BellsList bells={bells} />);

		expect(screen.getByText("Bell 0")).toBeTruthy();
		expect(screen.getByText("Bell 1")).toBeTruthy();
	});
});
