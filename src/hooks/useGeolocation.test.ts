import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GEOLOCATION_MESSAGES } from "../lib/geolocation/geolocation";
import { useGeolocation } from "./useGeolocation";

type SuccessFn = (position: GeolocationPosition) => void;
type ErrorFn = (error: GeolocationPositionError) => void;

function stubGeolocation(
	getCurrentPosition: (success: SuccessFn, error: ErrorFn) => void,
) {
	vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });
}

describe("useGeolocation", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("starts idle with no coordinates", () => {
		const { result } = renderHook(() => useGeolocation());

		expect(result.current.status).toBe("idle");
		expect(result.current.coords).toBeNull();
		expect(result.current.error).toBeNull();
	});

	it("stores the coordinates on a successful fix", () => {
		stubGeolocation((success) => {
			success({
				coords: { latitude: 40.2732, longitude: -76.8867 },
			} as GeolocationPosition);
		});

		const { result } = renderHook(() => useGeolocation());

		act(() => {
			result.current.request();
		});

		expect(result.current.status).toBe("ready");
		expect(result.current.coords).toEqual({ lat: 40.2732, lng: -76.8867 });
	});

	it("surfaces a friendly message when permission is denied", () => {
		stubGeolocation((_success, error) => {
			error({ code: 1 } as GeolocationPositionError);
		});

		const { result } = renderHook(() => useGeolocation());

		act(() => {
			result.current.request();
		});

		expect(result.current.status).toBe("error");
		expect(result.current.error).toBe(GEOLOCATION_MESSAGES.denied);
	});

	it("reports an unsupported browser without throwing", () => {
		vi.stubGlobal("navigator", {});

		const { result } = renderHook(() => useGeolocation());

		act(() => {
			result.current.request();
		});

		expect(result.current.status).toBe("error");
		expect(result.current.error).toBe(GEOLOCATION_MESSAGES.unsupported);
	});

	it("ignores a second request while a fix is pending", () => {
		const getCurrentPosition = vi.fn();
		stubGeolocation(getCurrentPosition);

		const { result } = renderHook(() => useGeolocation());

		act(() => {
			result.current.request();
			result.current.request();
		});

		expect(getCurrentPosition).toHaveBeenCalledTimes(1);
	});
});
