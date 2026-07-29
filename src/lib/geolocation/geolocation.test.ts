import { describe, expect, it } from "vitest";
import {
	GEOLOCATION_MESSAGES,
	getGeolocationErrorMessage,
	milesBetween,
} from "./geolocation";

describe("milesBetween", () => {
	it("returns zero for identical points", () => {
		const point = { lat: 40, lng: -77 };
		expect(milesBetween(point, point)).toBe(0);
	});

	it("measures the great-circle distance in miles", () => {
		// Philadelphia City Hall to Pittsburgh, ~257 miles apart.
		const philadelphia = { lat: 39.9526, lng: -75.1652 };
		const pittsburgh = { lat: 40.4406, lng: -79.9959 };
		expect(milesBetween(philadelphia, pittsburgh)).toBeCloseTo(257, 0);
	});

	it("is symmetric regardless of argument order", () => {
		const a = { lat: 40.2732, lng: -76.8867 };
		const b = { lat: 41.2033, lng: -77.1945 };
		expect(milesBetween(a, b)).toBeCloseTo(milesBetween(b, a), 6);
	});
});

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
