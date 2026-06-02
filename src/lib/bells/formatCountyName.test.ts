import { describe, expect, it } from "vitest";
import { formatCountyName } from "./formatCountyName";

describe("formatCountyName", () => {
	it("converts all-caps county names to title case", () => {
		expect(formatCountyName("ADAMS")).toBe("Adams");
		expect(formatCountyName("ALLEGHENY")).toBe("Allegheny");
		expect(formatCountyName("CLEARFIELD")).toBe("Clearfield");
	});

	it("leaves already title-cased names unchanged", () => {
		expect(formatCountyName("York")).toBe("York");
	});

	it("handles empty strings", () => {
		expect(formatCountyName("")).toBe("");
		expect(formatCountyName("   ")).toBe("");
	});
});
