const LOCAL_IMAGE_PREFIX = "/bells/images/";

export function getBellThumbnailUrl(imageUrl?: string): string | undefined {
	if (!imageUrl) return undefined;
	if (!imageUrl.startsWith(LOCAL_IMAGE_PREFIX)) return imageUrl;

	const filename = imageUrl.slice(LOCAL_IMAGE_PREFIX.length);
	const baseName = filename.replace(/\.[^.]+$/, "");
	return `${LOCAL_IMAGE_PREFIX}thumbs/${baseName}.webp`;
}
