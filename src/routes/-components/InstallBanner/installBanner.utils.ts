export const INSTALL_BANNER_DISMISS_KEY = "pa-bells-install-banner-dismissed";

/**
 * How the app can be installed on the current browser/platform:
 * - "prompt": Chromium (desktop + Android) — fires `beforeinstallprompt`, show Install button.
 * - "ios": iOS/iPadOS — must use Safari's Share → Add to Home Screen.
 * - "macos-safari": desktop Safari 17+ — Share → Add to Dock.
 * - "unsupported": no in-app install path (e.g. Firefox) — banner stays hidden.
 */
export type InstallMethod = "prompt" | "ios" | "macos-safari" | "unsupported";

export type InstallBannerContext = {
	dismissed: boolean;
	isStandalone: boolean;
	hasInstallPrompt: boolean;
	method: InstallMethod;
};

export function isStandaloneMode(): boolean {
	if (typeof window === "undefined") {
		return false;
	}

	if (window.matchMedia("(display-mode: standalone)").matches) {
		return true;
	}

	const navigatorWithStandalone = navigator as Navigator & {
		standalone?: boolean;
	};

	return navigatorWithStandalone.standalone === true;
}

/**
 * Determines the install method from the browser environment.
 *
 * Browser detection matters because the install UX differs per engine, and the
 * naive "MacIntel + touch points" iPadOS check also matches desktop Chrome on a
 * Mac (which reports touch points in responsive/device-emulation mode). The
 * iPadOS-as-Mac masquerade is unique to Safari, so we only treat it as iOS when
 * the engine is actually Safari.
 */
export function detectInstallMethod(
	userAgent: string,
	platform: string,
	maxTouchPoints: number,
): InstallMethod {
	const isChromium =
		/(chrome|chromium|crios|edg|edgios|samsungbrowser|opr|opera)/i.test(
			userAgent,
		);
	const isFirefox = /firefox|fxios/i.test(userAgent);
	// Every browser's UA string ends with "Safari"; only treat it as Safari once
	// Chromium and Firefox engines have been ruled out.
	const isSafari = !isChromium && !isFirefox && /safari/i.test(userAgent);

	const isIosUa = /iphone|ipad|ipod/i.test(userAgent);
	// iPadOS 13+ presents a desktop Mac user agent. Requiring Safari here prevents
	// desktop Chrome on a Mac from being misclassified as iOS.
	const isIpadOsDesktop =
		isSafari && platform === "MacIntel" && maxTouchPoints > 1;

	if (isIosUa || isIpadOsDesktop) {
		return "ios";
	}

	const isMac = platform === "MacIntel" || /mac os x|macintosh/i.test(userAgent);
	if (isMac && isSafari) {
		return "macos-safari";
	}

	// Chromium-based browsers (desktop and Android) support beforeinstallprompt.
	if (isChromium) {
		return "prompt";
	}

	return "unsupported";
}

/**
 * Browser-specific instructions describing how to install the app, or null when
 * there is nothing useful to show (the banner should stay hidden).
 */
export function getInstallInstruction(method: InstallMethod): string | null {
	switch (method) {
		case "prompt":
			return "Install PA Bells for quick access from your home screen.";
		case "ios":
			return "Install PA Bells: tap Share, then Add to Home Screen.";
		case "macos-safari":
			return "Install PA Bells: in Safari, click Share, then Add to Dock.";
		default:
			return null;
	}
}

export function getInstallBannerStorage(): Pick<
	Storage,
	"getItem" | "setItem"
> | null {
	if (typeof window === "undefined") {
		return null;
	}

	return window.localStorage;
}

export function readInstallBannerDismissed(
	storage: Pick<Storage, "getItem"> | null,
): boolean {
	if (!storage) {
		return false;
	}

	return storage.getItem(INSTALL_BANNER_DISMISS_KEY) === "1";
}

export function writeInstallBannerDismissed(
	storage: Pick<Storage, "setItem"> | null,
): void {
	if (!storage) {
		return;
	}

	storage.setItem(INSTALL_BANNER_DISMISS_KEY, "1");
}

export function shouldShowInstallBanner({
	dismissed,
	isStandalone,
	hasInstallPrompt,
	method,
}: InstallBannerContext): boolean {
	if (dismissed || isStandalone) {
		return false;
	}

	// A fired beforeinstallprompt is the strongest signal — the browser is
	// installable right now regardless of how UA detection classified it.
	if (hasInstallPrompt) {
		return true;
	}

	// Safari (iOS + macOS) never fires beforeinstallprompt, so show the manual
	// instructions instead.
	return method === "ios" || method === "macos-safari";
}
