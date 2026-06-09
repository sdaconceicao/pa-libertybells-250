import { describe, expect, it } from "vitest";
import { getBellThumbnailUrl } from "./bellImageUrls";

describe("getBellThumbnailUrl", () => {
	it("returns undefined when imageUrl is missing", () => {
		expect(getBellThumbnailUrl()).toBeUndefined();
		expect(getBellThumbnailUrl(undefined)).toBeUndefined();
	});

	it("maps local bell images to thumbs webp paths", () => {
		expect(getBellThumbnailUrl("/bells/images/adams-for-the-people.png")).toBe(
			"/bells/images/thumbs/adams-for-the-people.webp",
		);
		expect(getBellThumbnailUrl("/bells/images/foo.jpg")).toBe(
			"/bells/images/thumbs/foo.webp",
		);
	});

	it("passes through non-local image URLs unchanged", () => {
		const remote = "https://example.com/bell.png";
		expect(getBellThumbnailUrl(remote)).toBe(remote);
	});
});
