import { describe, expect, it, vi } from "vitest";
import {
	INSTALL_BANNER_DISMISS_KEY,
	getInstallBannerStorage,
	isIosDevice,
	isStandaloneMode,
	readInstallBannerDismissed,
	shouldShowInstallBanner,
	writeInstallBannerDismissed,
} from "./installBanner.utils";

describe("isIosDevice", () => {
	it("detects iPhone user agents", () => {
		expect(
			isIosDevice(
				"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
				"iPhone",
				5,
			),
		).toBe(true);
	});

	it("detects iPadOS desktop user agents", () => {
		expect(
			isIosDevice("Mozilla/5.0 (Macintosh; Intel Mac OS X)", "MacIntel", 5),
		).toBe(true);
	});

	it("returns false for Android user agents", () => {
		expect(
			isIosDevice("Mozilla/5.0 (Linux; Android 14)", "Linux armv8l", 5),
		).toBe(false);
	});
});

describe("install banner storage", () => {
	it("returns null storage when window is unavailable", () => {
		const originalWindow = globalThis.window;

		// @ts-expect-error simulate SSR
		delete globalThis.window;

		expect(getInstallBannerStorage()).toBeNull();
		expect(readInstallBannerDismissed(null)).toBe(false);

		globalThis.window = originalWindow;
	});

	it("reads and writes dismiss state", () => {
		const storage = new Map<string, string>();

		expect(
			readInstallBannerDismissed({
				getItem: (key) => storage.get(key) ?? null,
			}),
		).toBe(false);

		writeInstallBannerDismissed({
			setItem: (key, value) => {
				storage.set(key, value);
			},
		});

		expect(storage.get(INSTALL_BANNER_DISMISS_KEY)).toBe("1");
		expect(
			readInstallBannerDismissed({
				getItem: (key) => storage.get(key) ?? null,
			}),
		).toBe(true);
	});
});

describe("shouldShowInstallBanner", () => {
	it("hides when dismissed or already installed", () => {
		expect(
			shouldShowInstallBanner({
				dismissed: true,
				isStandalone: false,
				hasInstallPrompt: true,
				isIos: false,
			}),
		).toBe(false);

		expect(
			shouldShowInstallBanner({
				dismissed: false,
				isStandalone: true,
				hasInstallPrompt: true,
				isIos: true,
			}),
		).toBe(false);
	});

	it("shows on iOS or when an install prompt is available", () => {
		expect(
			shouldShowInstallBanner({
				dismissed: false,
				isStandalone: false,
				hasInstallPrompt: false,
				isIos: true,
			}),
		).toBe(true);

		expect(
			shouldShowInstallBanner({
				dismissed: false,
				isStandalone: false,
				hasInstallPrompt: true,
				isIos: false,
			}),
		).toBe(true);
	});

	it("hides when install is unavailable and the device is not iOS", () => {
		expect(
			shouldShowInstallBanner({
				dismissed: false,
				isStandalone: false,
				hasInstallPrompt: false,
				isIos: false,
			}),
		).toBe(false);
	});
});

describe("isStandaloneMode", () => {
	it("returns false when not running in standalone display mode", () => {
		vi.stubGlobal(
			"matchMedia",
			vi.fn().mockImplementation(() => ({
				matches: false,
				media: "(display-mode: standalone)",
				onchange: null,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				addListener: vi.fn(),
				removeListener: vi.fn(),
				dispatchEvent: vi.fn(),
			})),
		);

		expect(isStandaloneMode()).toBe(false);

		vi.unstubAllGlobals();
	});
});
