import { Download, X } from "lucide-react";
import styles from "./InstallBanner.module.css";
import { useInstallBanner } from "./useInstallBanner";

export type InstallBannerVariant = "map" | "list";

type Props = {
	variant: InstallBannerVariant;
};

export function InstallBanner({ variant }: Props) {
	const { visible, canInstall, isIos, handleDismiss, handleInstall } =
		useInstallBanner();

	if (!visible) {
		return null;
	}

	const message = canInstall
		? "Install PA Bells for quick access from your home screen."
		: isIos
			? "Install PA Bells: tap Share, then Add to Home Screen."
			: "Install PA Bells for quick access from your home screen.";

	const bannerClassName = [
		styles.banner,
		variant === "list" ? styles.bannerList : styles.bannerMap,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<aside className={bannerClassName} aria-label="Install app">
			<p className={styles.message}>{message}</p>
			<div className={styles.actions}>
				{canInstall ? (
					<button
						type="button"
						className={styles.installButton}
						onClick={handleInstall}
						aria-label="Install app"
					>
						<Download size={12} aria-hidden="true" />
						Install
					</button>
				) : null}
				<button
					type="button"
					className={styles.dismissButton}
					onClick={handleDismiss}
					aria-label="Dismiss install prompt"
				>
					<X size={16} aria-hidden="true" />
				</button>
			</div>
		</aside>
	);
}
