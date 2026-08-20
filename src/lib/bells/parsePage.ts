import * as cheerio from "cheerio";
import { addressFromRaw } from "./bellAddress";
import { parseBellPlacement } from "./parsePlacement";
import type { RawBell } from "./types";

const FIELD_RE =
	/^(Artist|Current Location|Unveiling Location|Sponsor):\s*(.*)$/i;
const TITLE_QUOTE_RE = /[""\u201c]([^""\u201d]+)[""\u201d]/;
/**
 * Street/city/zip signal that separates a real address from placeholder prose
 * such as "Final location coming soon." or an accessibility note. Cells whose
 * location has no such signal are skipped rather than geocoded, because a
 * signal-free query resolves to the center of Pennsylvania.
 */
const ADDRESS_HINT_RE = /,\s*(?:PA|Pennsylvania)\b|\b\d{5}(?:-\d{4})?\b/i;

type FieldKey =
	| "artist"
	| "current location"
	| "unveiling location"
	| "sponsor";

/** A cell that looked like a bell but could not be turned into one. */
export type SkippedCell = {
	county?: string;
	title?: string;
	reason: "missing-county-or-title" | "no-usable-location";
	/** Location text that was present but unusable, when there was any. */
	locationText?: string;
};

export type ParseBellsResult = {
	bells: RawBell[];
	skipped: SkippedCell[];
};

function normalizeText(text: string): string {
	return text.replace(/\s+/g, " ").trim();
}

function slugify(county: string, title: string): string {
	return `${county}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function parseBellsWithDiagnostics(html: string): ParseBellsResult {
	const $ = cheerio.load(html);
	const bells: RawBell[] = [];
	const skipped: SkippedCell[] = [];

	$(".gridCell.col").each((_, el) => {
		const $cell = $(el);
		let county = "";
		let title = "";
		let artist: string | undefined;
		let currentAddress = "";
		let unveilingAddress: string | undefined;
		let sponsor: string | undefined;
		const footnotes: string[] = [];
		/**
		 * Some cells put a field label in its own paragraph and its value in the
		 * next one (`<p>Current Location:</p><p>420 French St, Erie, PA</p>`).
		 * Holds the label that is still waiting for that follow-up paragraph.
		 */
		let pendingKey: FieldKey | undefined;
		/** Unlabelled paragraph that looks like an address, used as a last resort. */
		let looseAddress: string | undefined;
		/** Location text seen but rejected, kept so skips can be reported. */
		let rejectedAddress: string | undefined;

		const imageUrl = $cell.find("img").first().attr("src") || undefined;

		const assignField = (key: FieldKey, value: string) => {
			if (key === "artist") artist = value || undefined;
			else if (key === "sponsor") sponsor = value || undefined;
			else if (!ADDRESS_HINT_RE.test(value)) rejectedAddress ||= value;
			else if (key === "current location") currentAddress = value;
			else unveilingAddress = value;
		};

		$cell.find("p").each((__, p) => {
			const text = normalizeText($(p).text());
			if (!text) return;
			if (text.startsWith("*")) {
				footnotes.push(text.replace(/^\*\s*/, ""));
				pendingKey = undefined;
				return;
			}

			if (!county && /COUNTY/i.test(text)) {
				const countyMatch = text.match(/([A-Z][A-Za-z\s\-']+)\s+COUNTY/i);
				if (countyMatch) {
					const raw = countyMatch[1].trim();
					county = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
				}

				const titleMatch = text.match(TITLE_QUOTE_RE);
				if (titleMatch) title = titleMatch[1].trim();
				pendingKey = undefined;
				return;
			}

			const keyMatch = text.match(FIELD_RE);
			if (keyMatch) {
				const key = keyMatch[1].toLowerCase() as FieldKey;
				const value = keyMatch[2].trim();
				if (value) assignField(key, value);
				// A bare label means the value lives in a following paragraph.
				pendingKey = value ? undefined : key;
				return;
			}

			if (pendingKey) {
				const key = pendingKey;
				pendingKey = undefined;
				assignField(key, text);
				return;
			}

			if (!looseAddress && ADDRESS_HINT_RE.test(text)) looseAddress = text;
		});

		if (!county || !title) {
			// Cells with neither are layout filler, not bells.
			if (county || title) {
				skipped.push({ county, title, reason: "missing-county-or-title" });
			}
			return;
		}

		// Fall back to an unlabelled address paragraph for cells that omit the
		// "Current Location:" label entirely.
		if (!currentAddress && !unveilingAddress && looseAddress) {
			currentAddress = looseAddress;
		}

		const locationRaw = currentAddress || unveilingAddress || "";
		if (!locationRaw) {
			skipped.push({
				county,
				title,
				reason: "no-usable-location",
				locationText: rejectedAddress,
			});
			return;
		}

		const id = slugify(county, title);
		const placement = parseBellPlacement(footnotes);
		const address = addressFromRaw(locationRaw);
		const parsedUnveilingAddress =
			unveilingAddress && unveilingAddress !== currentAddress
				? addressFromRaw(unveilingAddress)
				: undefined;

		bells.push({
			id,
			county,
			title,
			artist,
			address,
			unveilingAddress: parsedUnveilingAddress,
			imageUrl,
			...(placement ? { placement } : {}),
			sponsor,
			sourceSlug: id,
		});
	});

	return { bells, skipped };
}

export function parseBells(html: string): RawBell[] {
	return parseBellsWithDiagnostics(html).bells;
}
