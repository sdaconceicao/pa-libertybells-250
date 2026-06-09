import fs from "node:fs/promises";
import path from "node:path";

const CONTENT_TYPE_EXT: Record<string, string> = {
	"image/png": ".png",
	"image/jpeg": ".jpg",
	"image/webp": ".webp",
	"image/gif": ".gif",
};

function extensionFromUrl(url: string): string {
	const pathname = new URL(url).pathname;
	const ext = path.extname(pathname).toLowerCase();
	if (ext === ".jpeg") return ".jpg";
	if ([".png", ".jpg", ".webp", ".gif"].includes(ext)) return ext;
	return ".png";
}

async function downloadImage(
	url: string,
): Promise<{ buffer: Buffer; ext: string }> {
	const res = await fetch(url, {
		headers: {
			"User-Agent": "bells-across-pa-map/1.0 (+contact@example.com)",
			Accept: "image/*",
		},
	});

	if (!res.ok) {
		throw new Error(`HTTP ${res.status} ${res.statusText}`);
	}

	const contentType = res.headers.get("content-type")?.split(";")[0]?.trim();
	const ext =
		(contentType && CONTENT_TYPE_EXT[contentType]) || extensionFromUrl(url);
	const buffer = Buffer.from(await res.arrayBuffer());
	return { buffer, ext };
}

export type BellWithImage = {
	id: string;
	imageUrl?: string;
};

export async function downloadBellImages<T extends BellWithImage>(
	bells: T[],
	imagesDir: string,
): Promise<T[]> {
	await fs.mkdir(imagesDir, { recursive: true });

	const updated: T[] = [];
	let downloaded = 0;
	let skipped = 0;
	let failed = 0;

	for (const bell of bells) {
		const remoteUrl = bell.imageUrl;
		if (!remoteUrl || remoteUrl.startsWith("/")) {
			updated.push(bell);
			skipped++;
			continue;
		}

		try {
			const { buffer, ext } = await downloadImage(remoteUrl);
			const filename = `${bell.id}${ext}`;
			await fs.writeFile(path.join(imagesDir, filename), buffer);
			updated.push({ ...bell, imageUrl: `/bells/images/${filename}` });
			downloaded++;
		} catch (err) {
			console.warn(`Failed to download image for ${bell.id}:`, err);
			updated.push(bell);
			failed++;
		}
	}

	console.log(
		`Images: downloaded=${downloaded} skipped=${skipped} failed=${failed}`,
	);

	return updated;
}
