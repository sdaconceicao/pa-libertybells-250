import type { BellPlacement } from "./types";

const INDOORS_NOTE =
	"this bell is indoors and only available for viewing during operating hours";

const OUTDOORS_NOTES: readonly string[] = [
	"the bell is located outdoors",
	"this bell requires using stairs to access it",
	"this bell is outdoors and only available for viewing during operating hours",
	"this bell is located indoors through april, 2026. it will be moved outdoors to the 9th street garden",
];

export function normalizeFootnote(text: string): string {
	return text
		.replace(/^\*\s*/, "")
		.replace(/\u00a0/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.toLowerCase()
		.replace(/\.+$/, "");
}

export function parseBellPlacement(
	footnotes: string[],
): BellPlacement | undefined {
	for (const raw of footnotes) {
		const note = normalizeFootnote(raw);
		if (note === INDOORS_NOTE) return "indoors";
		if (OUTDOORS_NOTES.includes(note)) return "outdoors";
	}
	return undefined;
}
