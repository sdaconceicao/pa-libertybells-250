export const INSTALL_BANNER_DISMISS_KEY = "pa-bells-install-banner-dismissed";

export type InstallBannerContext = {
	dismissed: boolean;
	isStandalone: boolean;
	hasInstallPrompt: boolean;
	isIos: boolean;
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

export function isIosDevice(
	userAgent: string,
	platform: string,
	maxTouchPoints: number,
): boolean {
	if (/iphone|ipad|ipod/i.test(userAgent)) {
		return true;
	}

	return platform === "MacIntel" && maxTouchPoints > 1;
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
	isIos,
}: InstallBannerContext): boolean {
	if (dismissed || isStandalone) {
		return false;
	}

	return hasInstallPrompt || isIos;
}
