import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { downloadBellImages } from "../src/lib/bells/downloadBellImages.js";
import { fetchBellsPageHtml } from "../src/lib/bells/fetchPage.js";
import { parseBellsWithDiagnostics } from "../src/lib/bells/parsePage.js";
import { geocodeBellAddresses } from "../src/lib/bells/geocode.js";
import {
	optimizeBellImages,
	removeBellImageOriginals,
} from "./optimizeBellImages.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
	console.log("Fetching Bells Across PA page...");
	const html = await fetchBellsPageHtml();

	console.log("Parsing bells from HTML...");
	const { bells: rawBells, skipped } = parseBellsWithDiagnostics(html);
	console.log(`Parsed ${rawBells.length} raw bells`);

	// Surfaced so a markup change on the source page cannot quietly drop bells.
	if (skipped.length) {
		console.warn(`Skipped ${skipped.length} cell(s):`);
		for (const cell of skipped) {
			const location = cell.locationText ? ` (${cell.locationText})` : "";
			console.warn(
				`  - ${cell.county ?? "?"}: ${cell.title ?? "?"} — ${cell.reason}${location}`,
			);
		}
	}

	console.log("Geocoding bell addresses...");
	const { bells: geocoded, summary } = await geocodeBellAddresses(rawBells);
	console.log(`Geocoded ${geocoded.length} bells`);
	console.log(
		`Summary: parsed=${summary.parsed} exact=${summary.exact} approximate=${summary.approximate} overrides=${summary.overrides}`,
	);
	console.log("By source:", summary.bySource);

	const imagesDir = path.resolve(__dirname, "../public/bells/images");
	console.log("Downloading bell images...");
	const withImages = await downloadBellImages(geocoded, imagesDir);

	console.log("Generating optimized WebP variants (thumbs, medium)...");
	await optimizeBellImages(imagesDir);

	console.log("Removing downloaded originals (only the variants are served)...");
	await removeBellImageOriginals(imagesDir);

	const dataPath = path.resolve(__dirname, "../src/lib/bells/bells.data.json");
	await fs.writeFile(dataPath, JSON.stringify(withImages, null, 2), "utf8");
	console.log(`Wrote data file to ${dataPath}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
