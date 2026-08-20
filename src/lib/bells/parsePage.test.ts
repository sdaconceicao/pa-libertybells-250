import { describe, expect, it } from "vitest";
import { parseBells, parseBellsWithDiagnostics } from "./parsePage";

/** Wraps cell paragraphs in the grid markup the source page uses. */
function cell(...paragraphs: string[]): string {
	const body = paragraphs.map((p) => `<p>${p}</p>`).join("");
	return `<div class="gridCell col">${body}</div>`;
}

const CANONICAL = cell(
	'<img src="https://example.test/lehigh.png" alt="Image">',
	"LEHIGH COUNTY<br>&ldquo;Liberty Rings&rdquo;",
	"Artist: Jane Doe",
	"Current Location: Allentown Art Museum, 31 N 5th St, Allentown, PA 18101",
	"*The bell is located outdoors.",
	"Sponsor: A Friend of Lehigh",
);

describe("parseBells", () => {
	it("parses a canonical cell with all fields inline", () => {
		const [bell] = parseBells(CANONICAL);
		expect(bell).toMatchObject({
			id: "lehigh-liberty-rings",
			county: "Lehigh",
			title: "Liberty Rings",
			artist: "Jane Doe",
			placement: "outdoors",
			sponsor: "A Friend of Lehigh",
			imageUrl: "https://example.test/lehigh.png",
		});
		expect(bell.address).toMatchObject({
			street: "31 N 5th St",
			city: "Allentown",
		});
	});

	it("reads a field value from the paragraph after a bare label", () => {
		const html = cell(
			'ERIE COUNTY<br>"The Pursuit of Liberty"',
			"Artist:",
			"Nicholas Cardell Gore",
			"Current Location:",
			"420 French Street, Erie, PA 16507",
			"Sponsor:",
			"FirstEnergy",
		);
		const [bell] = parseBells(html);
		expect(bell.artist).toBe("Nicholas Cardell Gore");
		expect(bell.sponsor).toBe("FirstEnergy");
		expect(bell.address).toMatchObject({
			street: "420 French Street",
			city: "Erie",
			zip: "16507",
		});
	});

	it("ignores prose between a bare location label and the address", () => {
		const html = cell(
			'ERIE COUNTY<br>"The Pursuit of Liberty"',
			"Current Location:",
			"Between expERIEnce Children's Museum - 420 French Street - &amp; 414 French Street, Erie, PA 16507",
			"Handicap parking is located near the museum with a sidewalk ramp.",
		);
		const [bell] = parseBells(html);
		expect(bell.address).toMatchObject({
			venueName: "expERIEnce Children's Museum",
			street: "420 French Street",
			city: "Erie",
			zip: "16507",
		});
	});

	it("falls back to an unlabelled address paragraph", () => {
		const html = cell(
			"LUZERNE COUNTY<br>&ldquo;Bringing Forth Unity&rdquo;",
			"Artist: Allison LaRussa",
			"The Wright Center, 169 N. Pennsylvania Ave, Wilkes-Barre, PA 18701",
			"* This bell is located indoors and available M-Sa, 8am-6pm",
			"Sponsor:",
		);
		const [bell] = parseBells(html);
		expect(bell.address).toMatchObject({
			street: "169 N. Pennsylvania Ave",
			city: "Wilkes-Barre",
			zip: "18701",
		});
	});

	it("skips cells whose location is a placeholder rather than an address", () => {
		const html = cell(
			'YORK COUNTY<br>"Dusk On The Farm"',
			"Artist: Annelise Vuono",
			"Current Location: Final location coming soon.",
			"Sponsor:",
		);
		const { bells, skipped } = parseBellsWithDiagnostics(html);
		expect(bells).toHaveLength(0);
		expect(skipped).toEqual([
			{
				county: "York",
				title: "Dusk On The Farm",
				reason: "no-usable-location",
				locationText: "Final location coming soon.",
			},
		]);
	});

	it("skips cells with no location at all and reports them", () => {
		const html = cell(
			"DELAWARE COUNTY<br>&ldquo;A Dream of Tomorrow&rdquo;",
			"Artist: Tucker Rodkey",
			"Final location information coming soon!",
			"Sponsor:",
		);
		const { bells, skipped } = parseBellsWithDiagnostics(html);
		expect(bells).toHaveLength(0);
		expect(skipped).toMatchObject([
			{ county: "Delaware", reason: "no-usable-location" },
		]);
	});

	it("ignores layout cells that hold no bell", () => {
		const { bells, skipped } = parseBellsWithDiagnostics(cell("", "&nbsp;"));
		expect(bells).toHaveLength(0);
		expect(skipped).toHaveLength(0);
	});

	it("prefers the current location over the unveiling location", () => {
		const html = cell(
			"BERKS COUNTY<br>&ldquo;Foundry Song&rdquo;",
			"Unveiling Location: 100 Penn St, Reading, PA 19601",
			"Current Location: 200 Washington St, Reading, PA 19601",
		);
		const [bell] = parseBells(html);
		expect(bell.address.street).toBe("200 Washington St");
		expect(bell.unveilingAddress?.street).toBe("100 Penn St");
	});
});
