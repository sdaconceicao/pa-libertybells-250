import { describe, expect, it, vi } from "vitest";
import {
	INSTALL_BANNER_DISMISS_KEY,
	detectInstallMethod,
	getInstallBannerStorage,
	getInstallInstruction,
	isStandaloneMode,
	readInstallBannerDismissed,
	shouldShowInstallBanner,
	writeInstallBannerDismissed,
} from "./installBanner.utils";

const IPHONE_SAFARI =
	"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const IPADOS_SAFARI =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
const MACOS_SAFARI =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
const MACOS_CHROME =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const ANDROID_CHROME =
	"Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";
const DESKTOP_FIREFOX =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:126.0) Gecko/20100101 Firefox/126.0";

describe("detectInstallMethod", () => {
	it("detects iPhone Safari as ios", () => {
		expect(detectInstallMethod(IPHONE_SAFARI, "iPhone", 5)).toBe("ios");
	});

	it("detects iPadOS (desktop Mac UA) Safari as ios", () => {
		expect(detectInstallMethod(IPADOS_SAFARI, "MacIntel", 5)).toBe("ios");
	});

	it("does not classify desktop Chrome on a Mac as ios even with touch points", () => {
		// Regression: Chrome desktop reports touch points in device-emulation mode.
		expect(detectInstallMethod(MACOS_CHROME, "MacIntel", 5)).toBe("prompt");
	});

	it("detects desktop Safari as macos-safari", () => {
		expect(detectInstallMethod(MACOS_SAFARI, "MacIntel", 0)).toBe(
			"macos-safari",
		);
	});

	it("detects Android Chrome as prompt", () => {
		expect(detectInstallMethod(ANDROID_CHROME, "Linux armv8l", 5)).toBe(
			"prompt",
		);
	});

	it("treats Firefox as unsupported", () => {
		expect(detectInstallMethod(DESKTOP_FIREFOX, "MacIntel", 0)).toBe(
			"unsupported",
		);
	});
});

describe("getInstallInstruction", () => {
	it("returns browser-specific copy", () => {
		expect(getInstallInstruction("ios")).toContain("Add to Home Screen");
		expect(getInstallInstruction("macos-safari")).toContain("Add to Dock");
		expect(getInstallInstruction("prompt")).toContain("quick access");
		expect(getInstallInstruction("unsupported")).toBeNull();
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
				method: "prompt",
			}),
		).toBe(false);

		expect(
			shouldShowInstallBanner({
				dismissed: false,
				isStandalone: true,
				hasInstallPrompt: true,
				method: "ios",
			}),
		).toBe(false);
	});

	it("always shows manual-install methods (Safari iOS/macOS)", () => {
		expect(
			shouldShowInstallBanner({
				dismissed: false,
				isStandalone: false,
				hasInstallPrompt: false,
				method: "ios",
			}),
		).toBe(true);

		expect(
			shouldShowInstallBanner({
				dismissed: false,
				isStandalone: false,
				hasInstallPrompt: false,
				method: "macos-safari",
			}),
		).toBe(true);
	});

	it("shows the prompt method only when an install prompt is available", () => {
		expect(
			shouldShowInstallBanner({
				dismissed: false,
				isStandalone: false,
				hasInstallPrompt: true,
				method: "prompt",
			}),
		).toBe(true);

		expect(
			shouldShowInstallBanner({
				dismissed: false,
				isStandalone: false,
				hasInstallPrompt: false,
				method: "prompt",
			}),
		).toBe(false);
	});

	it("hides for unsupported browsers", () => {
		expect(
			shouldShowInstallBanner({
				dismissed: false,
				isStandalone: false,
				hasInstallPrompt: false,
				method: "unsupported",
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
