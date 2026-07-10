import { useCallback, useEffect, useState } from "react";
import {
	detectInstallMethod,
	getInstallBannerStorage,
	getInstallInstruction,
	type InstallMethod,
	isStandaloneMode,
	readInstallBannerDismissed,
	shouldShowInstallBanner,
	writeInstallBannerDismissed,
} from "./installBanner.utils";

type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function useInstallBanner() {
	const [dismissed, setDismissed] = useState(false);
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [method, setMethod] = useState<InstallMethod>("unsupported");
	const [isStandalone, setIsStandalone] = useState(false);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
		setDismissed(readInstallBannerDismissed(getInstallBannerStorage()));
		setIsStandalone(isStandaloneMode());
		setMethod(
			detectInstallMethod(
				navigator.userAgent,
				navigator.platform,
				navigator.maxTouchPoints,
			),
		);

		const handleBeforeInstallPrompt = (event: Event) => {
			event.preventDefault();
			setDeferredPrompt(event as BeforeInstallPromptEvent);
		};

		const handleAppInstalled = () => {
			setDeferredPrompt(null);
			setIsStandalone(true);
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		window.addEventListener("appinstalled", handleAppInstalled);

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt,
			);
			window.removeEventListener("appinstalled", handleAppInstalled);
		};
	}, []);

	const handleDismiss = useCallback(() => {
		writeInstallBannerDismissed(getInstallBannerStorage());
		setDismissed(true);
	}, []);

	const handleInstall = useCallback(async () => {
		if (!deferredPrompt) {
			return;
		}

		await deferredPrompt.prompt();
		await deferredPrompt.userChoice;
		setDeferredPrompt(null);
	}, [deferredPrompt]);

	const visible =
		isClient &&
		shouldShowInstallBanner({
			dismissed,
			isStandalone,
			hasInstallPrompt: deferredPrompt !== null,
			method,
		});

	const canInstall = deferredPrompt !== null;

	return {
		visible,
		canInstall,
		// When the prompt is live the install is a one-tap button, so prefer the
		// generic prompt copy over any manual fallback instructions.
		message: getInstallInstruction(canInstall ? "prompt" : method) ?? "",
		handleDismiss,
		handleInstall,
	};
}
