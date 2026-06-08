import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Bell } from "../../../lib/bells/types";
import { BellPopupContent } from "./BellPopupContent";

function makeBell(
	overrides: Partial<Bell> & Pick<Bell, "id" | "county">,
): Bell {
	return {
		title: "Test Bell",
		address: {
			street: "123 Main St",
			city: "York",
			zip: "17401",
		},
		sourceSlug: "test",
		lat: 40,
		lng: -77,
		...overrides,
		id: overrides.id,
		county: overrides.county,
	};
}

describe("BellPopupContent", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders title, artist, and structured address lines", () => {
		render(
			<BellPopupContent
				bell={makeBell({
					id: "a",
					county: "York",
					title: "Liberty Bell",
					artist: "Jane Doe",
					address: {
						street: "456 Market St",
						city: "Harrisburg",
						zip: "17101",
					},
				})}
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Liberty Bell" }),
		).toBeTruthy();
		expect(screen.getByText("by Jane Doe")).toBeTruthy();
		expect(screen.getByText("456 Market St")).toBeTruthy();
		expect(screen.getByText("Harrisburg, PA 17101")).toBeTruthy();
	});

	it("renders image when imageUrl is present", () => {
		const { container } = render(
			<BellPopupContent
				bell={makeBell({
					id: "a",
					county: "York",
					imageUrl: "/bells/images/test.png",
				})}
			/>,
		);

		const image = container.querySelector(
			'img[src="/bells/images/test.png"]',
		);
		expect(image).toBeTruthy();
		expect(image?.getAttribute("alt")).toBe("");
	});

	it("renders placeholder when imageUrl is absent", () => {
		const { container } = render(
			<BellPopupContent bell={makeBell({ id: "a", county: "York" })} />,
		);

		expect(container.querySelector("img")).toBeNull();
		expect(
			container.querySelector('[class*="headerPlaceholder"]'),
		).toBeTruthy();
	});

	it("shows indoor icon with accessible label when placement is indoors", () => {
		render(
			<BellPopupContent
				bell={makeBell({
					id: "a",
					county: "York",
					placement: "indoors",
				})}
			/>,
		);

		expect(screen.getByLabelText("Indoor")).toBeTruthy();
	});

	it("shows outdoor icon with accessible label when placement is outdoors", () => {
		render(
			<BellPopupContent
				bell={makeBell({
					id: "a",
					county: "York",
					placement: "outdoors",
				})}
			/>,
		);

		expect(screen.getByLabelText("Outdoor")).toBeTruthy();
	});

	it("hides placement bar when placement is unknown", () => {
		render(
			<BellPopupContent bell={makeBell({ id: "a", county: "York" })} />,
		);

		expect(screen.queryByLabelText("Indoor")).toBeNull();
		expect(screen.queryByLabelText("Outdoor")).toBeNull();
	});

	it("does not render county, locality, or geocode warning", () => {
		render(
			<BellPopupContent
				bell={makeBell({
					id: "a",
					county: "York",
					localityLabel: "York, PA",
					geocodeQuality: "approximate",
					geocodeSource: "county_centroid",
				})}
			/>,
		);

		expect(screen.queryByText(/York County/)).toBeNull();
		expect(screen.queryByText(/Locality:/)).toBeNull();
		expect(screen.queryByText(/Approximate map location/)).toBeNull();
	});

	it("omits artist line when artist is absent", () => {
		render(
			<BellPopupContent bell={makeBell({ id: "a", county: "York" })} />,
		);

		expect(screen.queryByText(/^by /)).toBeNull();
	});

	it("applies popup test id", () => {
		render(
			<BellPopupContent bell={makeBell({ id: "a", county: "York" })} />,
		);

		expect(screen.getByTestId("bell-popup")).toBeTruthy();
	});
});
