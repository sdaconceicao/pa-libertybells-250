import { describe, expect, it } from "vitest";
import {
	addressFromRaw,
	buildAddressLines,
	buildAddressString,
	buildGeocodeQuery,
	buildLocalityLabel,
	buildMapsUrl,
} from "./bellAddress";

describe("addressFromRaw", () => {
	it("parses scraped location text into structured fields", () => {
		expect(
			addressFromRaw(
				"Beyond the Battle Museum, 625 Biglerville Road, Gettysburg, PA 17325",
			),
		).toEqual({
			venueName: "Beyond the Battle Museum",
			street: "625 Biglerville Road",
			city: "Gettysburg",
			zip: "17325",
		});
	});
});

describe("buildAddressLines", () => {
	it("returns venue, street, and city-state-zip lines", () => {
		expect(
			buildAddressLines({
				venueName: "Beyond the Battle Museum",
				street: "625 Biglerville Road",
				city: "Gettysburg",
				zip: "17325",
			}),
		).toEqual([
			"Beyond the Battle Museum",
			"625 Biglerville Road",
			"Gettysburg, PA 17325",
		]);
	});

	it("keeps city and state on one line without a zip", () => {
		expect(
			buildAddressLines({
				street: "620 W 3rd St",
				city: "Bloomsburg",
			}),
		).toEqual(["620 W 3rd St", "Bloomsburg, PA"]);
	});
});

describe("buildAddressString", () => {
	it("joins structured address lines for display and logging", () => {
		expect(
			buildAddressString({
				venueName: "Heinz History Center",
				street: "1212 Smallman Street",
				city: "Pittsburgh",
				zip: "15222",
			}),
		).toBe("Heinz History Center, 1212 Smallman Street, Pittsburgh, PA 15222");
	});
});

describe("buildGeocodeQuery", () => {
	it("builds a street-first geocode query", () => {
		expect(
			buildGeocodeQuery({
				street: "625 Biglerville Road",
				city: "Gettysburg",
				zip: "17325",
			}),
		).toBe("625 Biglerville Road, Gettysburg, PA 17325");
	});

	it("falls back to city when street is missing", () => {
		expect(
			buildGeocodeQuery({
				venueName: "Visit Luzerne County",
				city: "Wilkes-Barre",
			}),
		).toBe("Wilkes-Barre, PA");
	});
});

describe("buildLocalityLabel", () => {
	it("returns city and state label", () => {
		expect(buildLocalityLabel({ city: "Gettysburg" })).toBe("Gettysburg, PA");
	});
});

describe("buildMapsUrl", () => {
	it("builds a Google Maps search URL from the structured address", () => {
		expect(
			buildMapsUrl(40.1, -77.2, {
				street: "456 Market St",
				city: "Harrisburg",
				zip: "17101",
			}),
		).toBe(
			"https://www.google.com/maps/search/?api=1&query=456%20Market%20St%2C%20Harrisburg%2C%20PA%2017101",
		);
	});

	it("falls back to coordinates when no address is provided", () => {
		expect(buildMapsUrl(40.1, -77.2)).toBe(
			"https://www.google.com/maps/search/?api=1&query=40.1,-77.2",
		);
	});
});
