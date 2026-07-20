import { describe, expect, it } from "vitest";
import {
	GEOLOCATION_MESSAGES,
	getGeolocationErrorMessage,
} from "./geolocation";

describe("getGeolocationErrorMessage", () => {
	it("returns the denied message for PERMISSION_DENIED (code 1)", () => {
		expect(getGeolocationErrorMessage({ code: 1 })).toBe(
			GEOLOCATION_MESSAGES.denied,
		);
	});

	it("returns the unavailable message for POSITION_UNAVAILABLE (code 2)", () => {
		expect(getGeolocationErrorMessage({ code: 2 })).toBe(
			GEOLOCATION_MESSAGES.unavailable,
		);
	});

	it("returns the timeout message for TIMEOUT (code 3)", () => {
		expect(getGeolocationErrorMessage({ code: 3 })).toBe(
			GEOLOCATION_MESSAGES.timeout,
		);
	});

	it("falls back to the generic message for unknown codes", () => {
		expect(getGeolocationErrorMessage({ code: 0 })).toBe(
			GEOLOCATION_MESSAGES.generic,
		);
	});
});
