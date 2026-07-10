import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

	it("renders the address as a maps link", () => {
		render(
			<BellPopupContent
				bell={makeBell({
					id: "a",
					county: "York",
					address: {
						street: "456 Market St",
						city: "Harrisburg",
						zip: "17101",
					},
					lat: 40.26,
					lng: -76.88,
				})}
			/>,
		);

		const link = screen.getByRole("link", {
			name: "Open 456 Market St, Harrisburg, PA 17101 in maps",
		});

		expect(link.getAttribute("href")).toBe(
			"https://www.google.com/maps/search/?api=1&query=456%20Market%20St%2C%20Harrisburg%2C%20PA%2017101",
		);
		expect(link.getAttribute("target")).toBe("_blank");
		expect(link.getAttribute("rel")).toBe("noopener noreferrer");
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

		expect(screen.getByRole("heading", { name: "Liberty Bell" })).toBeTruthy();
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

		// imageUrl is rewritten to the optimized medium WebP variant
		const image = container.querySelector(
			'img[src="/bells/images/medium/test.webp"]',
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
		render(<BellPopupContent bell={makeBell({ id: "a", county: "York" })} />);

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
		render(<BellPopupContent bell={makeBell({ id: "a", county: "York" })} />);

		expect(screen.queryByText(/^by /)).toBeNull();
	});

	it("applies popup test id", () => {
		render(<BellPopupContent bell={makeBell({ id: "a", county: "York" })} />);

		expect(screen.getByTestId("bell-popup")).toBeTruthy();
	});

	it("applies sidebar variant class when variant is sidebar", () => {
		const { container } = render(
			<BellPopupContent
				bell={makeBell({ id: "a", county: "York" })}
				variant="sidebar"
			/>,
		);

		expect(container.querySelector('[class*="popupSidebar"]')).toBeTruthy();
	});

	it("renders close button when onClose is provided", () => {
		render(
			<BellPopupContent
				bell={makeBell({ id: "a", county: "York" })}
				variant="sidebar"
				onClose={() => {}}
			/>,
		);

		expect(
			screen.getByRole("button", { name: "Close selected bell" }),
		).toBeTruthy();
	});

	it("does not render close button when onClose is absent", () => {
		render(<BellPopupContent bell={makeBell({ id: "a", county: "York" })} />);

		expect(
			screen.queryByRole("button", { name: "Close selected bell" }),
		).toBeNull();
	});

	it("calls onClose when close button is clicked", () => {
		const onClose = vi.fn();

		render(
			<BellPopupContent
				bell={makeBell({ id: "a", county: "York" })}
				variant="sidebar"
				onClose={onClose}
			/>,
		);

		fireEvent.click(
			screen.getByRole("button", { name: "Close selected bell" }),
		);

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("does not render navigation buttons when handlers are absent", () => {
		render(<BellPopupContent bell={makeBell({ id: "a", county: "York" })} />);

		expect(screen.queryByRole("button", { name: "Previous bell" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Next bell" })).toBeNull();
	});

	it("renders navigation buttons when handlers are provided", () => {
		render(
			<BellPopupContent
				bell={makeBell({ id: "b", county: "York" })}
				onPrevious={() => {}}
				onNext={() => {}}
				hasPrevious
				hasNext
			/>,
		);

		expect(screen.getByRole("button", { name: "Previous bell" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Next bell" })).toBeTruthy();
	});

	it("renders list position between navigation buttons when provided", () => {
		render(
			<BellPopupContent
				bell={makeBell({ id: "b", county: "York" })}
				onPrevious={() => {}}
				onNext={() => {}}
				listPosition={2}
				listTotal={5}
			/>,
		);

		expect(screen.getByText("2 of 5 bells")).toBeTruthy();
	});

	it("does not render list position when position is absent", () => {
		render(
			<BellPopupContent
				bell={makeBell({ id: "b", county: "York" })}
				onPrevious={() => {}}
				onNext={() => {}}
				listTotal={5}
			/>,
		);

		expect(screen.queryByText(/of 5 bells/)).toBeNull();
	});

	it("disables navigation buttons at list boundaries", () => {
		render(
			<BellPopupContent
				bell={makeBell({ id: "a", county: "York" })}
				onPrevious={() => {}}
				onNext={() => {}}
			/>,
		);

		expect(
			screen.getByRole("button", { name: "Previous bell" }),
		).toHaveProperty("disabled", true);
		expect(screen.getByRole("button", { name: "Next bell" })).toHaveProperty(
			"disabled",
			true,
		);
	});

	it("calls navigation handlers when enabled buttons are clicked", () => {
		const onPrevious = vi.fn();
		const onNext = vi.fn();

		render(
			<BellPopupContent
				bell={makeBell({ id: "b", county: "York" })}
				onPrevious={onPrevious}
				onNext={onNext}
				hasPrevious
				hasNext
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Previous bell" }));
		fireEvent.click(screen.getByRole("button", { name: "Next bell" }));

		expect(onPrevious).toHaveBeenCalledTimes(1);
		expect(onNext).toHaveBeenCalledTimes(1);
	});
});
