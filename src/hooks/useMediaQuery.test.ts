import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMediaQuery } from "./useMediaQuery";

function createMatchMedia(matches: boolean) {
	return vi.fn().mockImplementation((query: string) => ({
		matches,
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		addListener: vi.fn(),
		removeListener: vi.fn(),
		dispatchEvent: vi.fn(),
	}));
}

describe("useMediaQuery", () => {
	beforeEach(() => {
		vi.stubGlobal("matchMedia", createMatchMedia(false));
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("returns false when the query does not match", () => {
		const { result } = renderHook(() => useMediaQuery("(max-width: 767px)"));

		expect(result.current).toBe(false);
	});

	it("returns true when the query matches", () => {
		vi.stubGlobal("matchMedia", createMatchMedia(true));

		const { result } = renderHook(() => useMediaQuery("(max-width: 767px)"));

		expect(result.current).toBe(true);
	});

	it("updates when the media query changes", () => {
		const listeners = new Map<string, (event: MediaQueryListEvent) => void>();
		const mediaQuery = {
			matches: false,
			media: "(max-width: 767px)",
			addEventListener: vi.fn(
				(event: string, listener: (event: MediaQueryListEvent) => void) => {
					listeners.set(event, listener);
				},
			),
			removeEventListener: vi.fn(),
		};

		vi.stubGlobal(
			"matchMedia",
			vi.fn().mockImplementation(() => mediaQuery),
		);

		const { result } = renderHook(() => useMediaQuery("(max-width: 767px)"));

		expect(result.current).toBe(false);

		act(() => {
			mediaQuery.matches = true;
			listeners.get("change")?.({
				matches: true,
			} as MediaQueryListEvent);
		});

		expect(result.current).toBe(true);
	});
});
