/**
 * Generates optimized WebP variants of the bell photos in public/bells/images:
 *   - thumbs/<name>.webp  (120px wide  — list thumbnails, ~3x the 40px slot)
 *   - medium/<name>.webp  (800px wide  — popup/sidebar header images)
 *
 * Originals are left untouched here so this can be re-run standalone; the
 * sync deletes them afterwards via removeBellImageOriginals(), since only the
 * variants are ever served. Runs automatically at the end of
 * `pnpm sync:bells`, or standalone via:
 *   pnpm optimize:images
 */
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

/** Original formats we generate variants from (must stay in sync with bellImageVariants.ts). */
const SOURCE_PATTERN = /\.(png|jpe?g|webp|gif)$/i;

const VARIANTS = [
	{ dir: "thumbs", width: 120, quality: 70 },
	{ dir: "medium", width: 800, quality: 75 },
] as const;

export async function optimizeBellImages(imagesDir: string): Promise<number> {
	const entries = await readdir(imagesDir, { withFileTypes: true });
	const files = entries
		.filter((entry) => entry.isFile() && SOURCE_PATTERN.test(entry.name))
		.map((entry) => entry.name);

	for (const variant of VARIANTS) {
		await mkdir(path.join(imagesDir, variant.dir), { recursive: true });
	}

	let done = 0;
	for (const file of files) {
		const base = file.replace(SOURCE_PATTERN, "");
		const source = path.join(imagesDir, file);
		await Promise.all(
			VARIANTS.map((variant) =>
				sharp(source)
					.resize({ width: variant.width, withoutEnlargement: true })
					.webp({ quality: variant.quality })
					.toFile(path.join(imagesDir, variant.dir, `${base}.webp`)),
			),
		);
		done += 1;
	}
	console.log(
		`Optimized ${done} images into ${VARIANTS.length} variants (thumbs, medium).`,
	);
	return done;
}

/**
 * Deletes the downloaded originals once their variants exist. Nothing serves
 * them — the UI always routes through getBellThumbUrl/getBellMediumUrl — and at
 * ~1MB each they dwarf the variants they produce. An original is only removed
 * when every variant was written, so a failed resize never loses its source.
 */
export async function removeBellImageOriginals(
	imagesDir: string,
): Promise<number> {
	const entries = await readdir(imagesDir, { withFileTypes: true });
	const files = entries
		.filter((entry) => entry.isFile() && SOURCE_PATTERN.test(entry.name))
		.map((entry) => entry.name);

	let removed = 0;
	let kept = 0;
	for (const file of files) {
		const base = file.replace(SOURCE_PATTERN, "");
		const variants = VARIANTS.map((variant) =>
			path.join(imagesDir, variant.dir, `${base}.webp`),
		);
		const present = await Promise.all(
			variants.map((variant) =>
				stat(variant).then(
					() => true,
					() => false,
				),
			),
		);

		if (!present.every(Boolean)) {
			console.warn(`Keeping ${file}: not every variant was generated.`);
			kept++;
			continue;
		}

		await rm(path.join(imagesDir, file));
		removed++;
	}

	console.log(`Originals: removed=${removed} kept=${kept}`);
	return removed;
}

// CLI entry point: only run when executed directly (not when imported by syncBells).
if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(process.argv[1]).href
) {
	optimizeBellImages(path.resolve("public/bells/images")).catch((error) => {
		console.error(error);
		process.exit(1);
	});
}
