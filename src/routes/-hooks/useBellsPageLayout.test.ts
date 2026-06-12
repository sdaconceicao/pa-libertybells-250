import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useBellsPageLayout } from "./useBellsPageLayout";

const matchMediaMock = vi.fn();

describe("useBellsPageLayout", () => {
	beforeEach(() => {
		matchMediaMock.mockImplementation((query: string) => ({
			matches: false,
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		}));
		vi.stubGlobal("matchMedia", matchMediaMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("defaults to desktop layout state", () => {
		const { result } = renderHook(() => useBellsPageLayout());

		expect(result.current.isMobile).toBe(false);
		expect(result.current.sidebarOpen).toBe(true);
		expect(result.current.mobileView).toBe("list");
	});

	it("closes and reopens the sidebar", () => {
		const { result } = renderHook(() => useBellsPageLayout());

		act(() => {
			result.current.closeSidebar();
		});

		expect(result.current.sidebarOpen).toBe(false);

		act(() => {
			result.current.openSidebar();
		});

		expect(result.current.sidebarOpen).toBe(true);
	});

	it("switches mobile views", () => {
		const { result } = renderHook(() => useBellsPageLayout());

		act(() => {
			result.current.showMap();
		});

		expect(result.current.mobileView).toBe("map");

		act(() => {
			result.current.showList();
		});

		expect(result.current.mobileView).toBe("list");
	});

	it("detects mobile breakpoints", () => {
		matchMediaMock.mockImplementation((query: string) => ({
			matches: query === "(max-width: 767px)",
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		}));

		const { result } = renderHook(() => useBellsPageLayout());

		expect(result.current.isMobile).toBe(true);
	});
});
