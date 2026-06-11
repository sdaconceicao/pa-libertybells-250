import { describe, expect, it } from "vitest";
import type { Bell } from "../../lib/bells/types";
import { getBellNavigation } from "./getBellNavigation";

function makeBell(id: string): Bell {
	return {
		id,
		title: `Bell ${id}`,
		county: "York",
		address: { street: "123 Main St", city: "York", zip: "17401" },
		sourceSlug: "test",
		lat: 40,
		lng: -77,
	};
}

describe("getBellNavigation", () => {
	const bells = [makeBell("a"), makeBell("b"), makeBell("c")];

	it("returns null neighbors when the current id is not in the list", () => {
		expect(getBellNavigation(bells, "missing")).toEqual({
			previousId: null,
			nextId: null,
			position: null,
			total: 3,
		});
	});

	it("returns only a next id for the first bell", () => {
		expect(getBellNavigation(bells, "a")).toEqual({
			previousId: null,
			nextId: "b",
			position: 1,
			total: 3,
		});
	});

	it("returns both neighbors for a middle bell", () => {
		expect(getBellNavigation(bells, "b")).toEqual({
			previousId: "a",
			nextId: "c",
			position: 2,
			total: 3,
		});
	});

	it("returns only a previous id for the last bell", () => {
		expect(getBellNavigation(bells, "c")).toEqual({
			previousId: "b",
			nextId: null,
			position: 3,
			total: 3,
		});
	});

	it("returns null neighbors for a single-item list", () => {
		expect(getBellNavigation([makeBell("only")], "only")).toEqual({
			previousId: null,
			nextId: null,
			position: 1,
			total: 1,
		});
	});
});
