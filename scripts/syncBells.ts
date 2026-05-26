import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchBellsPageHtml } from "../src/lib/bells/fetchPage.js";
import { parseBells } from "../src/lib/bells/parsePage.js";
import { geocodeBellAddresses } from "../src/lib/bells/geocode.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Fetching Bells Across PA page...");
  const html = await fetchBellsPageHtml();

  console.log("Parsing bells from HTML...");
  const rawBells = parseBells(html);
  console.log(`Parsed ${rawBells.length} raw bells`);

  console.log("Geocoding bell addresses...");
  const { bells: geocoded, summary } = await geocodeBellAddresses(rawBells);
  console.log(`Geocoded ${geocoded.length} bells`);
  console.log(
    `Summary: parsed=${summary.parsed} exact=${summary.exact} approximate=${summary.approximate} overrides=${summary.overrides}`,
  );
  console.log("By source:", summary.bySource);

  const dataPath = path.resolve(__dirname, "../src/lib/bells/bells.data.json");
  await fs.writeFile(dataPath, JSON.stringify(geocoded, null, 2), "utf8");
  console.log(`Wrote data file to ${dataPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
