import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getBellThumbnailUrl } from "./bellImageUrls.js";

const CONTENT_TYPE_EXT: Record<string, string> = {
	"image/png": ".png",
	"image/jpeg": ".jpg",
	"image/webp": ".webp",
	"image/gif": ".gif",
};

const THUMB_SIZE = 80;
const THUMB_QUALITY = 80;
const LOCAL_IMAGE_PREFIX = "/bells/images/";

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

export async function generateThumbnailBuffer(buffer: Buffer): Promise<Buffer> {
	return sharp(buffer)
		.resize(THUMB_SIZE, THUMB_SIZE, { fit: "cover" })
		.webp({ quality: THUMB_QUALITY })
		.toBuffer();
}

function localImagePath(imagesDir: string, imageUrl: string): string | null {
	if (!imageUrl.startsWith(LOCAL_IMAGE_PREFIX)) return null;
	return path.join(imagesDir, imageUrl.slice(LOCAL_IMAGE_PREFIX.length));
}

function thumbnailPath(imagesDir: string, imageUrl: string): string | null {
	const thumbUrl = getBellThumbnailUrl(imageUrl);
	if (!thumbUrl) return null;
	return path.join(imagesDir, thumbUrl.slice(LOCAL_IMAGE_PREFIX.length));
}

async function writeThumbnail(
	imagesDir: string,
	imageUrl: string,
	source: Buffer,
): Promise<void> {
	const thumbPath = thumbnailPath(imagesDir, imageUrl);
	if (!thumbPath) return;

	await fs.mkdir(path.dirname(thumbPath), { recursive: true });
	const thumbBuffer = await generateThumbnailBuffer(source);
	await fs.writeFile(thumbPath, thumbBuffer);
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
	let thumbsGenerated = 0;
	let thumbsFailed = 0;

	for (const bell of bells) {
		const remoteUrl = bell.imageUrl;
		if (!remoteUrl) {
			updated.push(bell);
			skipped++;
			continue;
		}

		if (remoteUrl.startsWith("/")) {
			updated.push(bell);
			skipped++;

			const localPath = localImagePath(imagesDir, remoteUrl);
			if (!localPath) continue;

			try {
				const buffer = await fs.readFile(localPath);
				await writeThumbnail(imagesDir, remoteUrl, buffer);
				thumbsGenerated++;
			} catch (err) {
				console.warn(`Failed to generate thumbnail for ${bell.id}:`, err);
				thumbsFailed++;
			}
			continue;
		}

		try {
			const { buffer, ext } = await downloadImage(remoteUrl);
			const filename = `${bell.id}${ext}`;
			const imageUrl = `/bells/images/${filename}`;
			await fs.writeFile(path.join(imagesDir, filename), buffer);
			await writeThumbnail(imagesDir, imageUrl, buffer);
			updated.push({ ...bell, imageUrl });
			downloaded++;
			thumbsGenerated++;
		} catch (err) {
			console.warn(`Failed to download image for ${bell.id}:`, err);
			updated.push(bell);
			failed++;
		}
	}

	console.log(
		`Images: downloaded=${downloaded} skipped=${skipped} failed=${failed} thumbs=${thumbsGenerated} thumbsFailed=${thumbsFailed}`,
	);

	return updated;
}
