import { Button, IconButton, ImagePlaceholder } from "@code-x/lago";
import { ArrowRight, X } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { useAuth } from "../../../lib/auth/authClient";
import { getBellMediumUrl } from "../../../lib/bells/bellImageVariants";
import type { Bell } from "../../../lib/bells/types";
import { useAuthModal } from "../AuthModal/AuthModalContext";
import { Logo } from "../Logo/Logo";
import styles from "./LandingOverlay.module.css";
import { LANDING_STEPS, selectFeaturedBells } from "./LandingOverlay.utils";
import { useLandingOverlayState } from "./useLandingOverlay";

type Props = {
	bells: Bell[];
	onBellSelect: (bellId: string) => void;
	sidebarOpen?: boolean;
};

export function LandingOverlay({
	bells,
	onBellSelect,
	sidebarOpen = false,
}: Props) {
	const { visible, dismiss } = useLandingOverlayState();
	const { isAuthed } = useAuth();
	const { openAuthModal, isOpen: isAuthModalOpen } = useAuthModal();
	const featuredBells = useMemo(() => selectFeaturedBells(bells), [bells]);

	const handleFeaturedSelect = useCallback(
		(bellId: string) => {
			dismiss();
			onBellSelect(bellId);
		},
		[dismiss, onBellSelect],
	);

	const handleCreateAccount = useCallback(() => {
		openAuthModal("register");
	}, [openAuthModal]);

	useEffect(() => {
		if (!visible) {
			return;
		}

		function handleKey(event: KeyboardEvent) {
			if (event.key === "Escape" && !isAuthModalOpen) {
				dismiss();
			}
		}

		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [dismiss, isAuthModalOpen, visible]);

	if (!visible) {
		return null;
	}

	const panelClassName = [
		styles.panel,
		sidebarOpen ? styles.panelBesideSidebar : styles.panelSidebarClosed,
	].join(" ");

	return (
		<section
			className={panelClassName}
			data-testid="landing-overlay"
			aria-labelledby="landing-overlay-title"
		>
			<IconButton
				variant="quiet"
				aria-label="Close"
				className={styles.close}
				onPress={dismiss}
			>
				<X size={16} aria-hidden="true" />
			</IconButton>

			<div className={styles.hero}>
				<div className={styles.heroCopy}>
					<p className={styles.eyebrow}>A statewide celebration</p>
					<h1 className={styles.title} id="landing-overlay-title">
						Discover Pennsylvania’s Liberty Bells
					</h1>
					<p className={styles.tagline}>
						Find. Visit. Collect. For America’s 250th Anniversary.
					</p>
					<p className={styles.body}>
						Explore the bells, visit them in person, and collect their stories
						as we celebrate Pennsylvania’s people, places, and the enduring
						spirit of liberty.
					</p>
				</div>
				<div className={styles.brand}>
					<Logo variant="circle" className={styles.brandLogo} />
					<p className={styles.years}>1776 – 2026</p>
				</div>
			</div>

			<div className={styles.actions}>
				<Button
					variant="primary"
					className={styles.actionButton}
					onPress={dismiss}
				>
					Explore the Bells
					<ArrowRight size={16} aria-hidden="true" />
				</Button>
				{isAuthed ? null : (
					<Button
						variant="secondary"
						className={styles.actionButton}
						onPress={handleCreateAccount}
					>
						Create an Account
					</Button>
				)}
			</div>

			<ol className={styles.steps}>
				{LANDING_STEPS.map((step) => (
					<li key={step.number} className={styles.step}>
						<span className={styles.stepNumber} aria-hidden="true">
							{step.number}
						</span>
						<div>
							<h2 className={styles.stepTitle}>{step.title}</h2>
							<p className={styles.stepDescription}>{step.description}</p>
						</div>
					</li>
				))}
			</ol>

			{featuredBells.length > 0 ? (
				<section className={styles.featured} aria-labelledby="featured-bells">
					<div className={styles.featuredHeader}>
						<h2 className={styles.featuredTitle} id="featured-bells">
							Featured Bells
						</h2>
						<button type="button" className={styles.viewAll} onClick={dismiss}>
							View All Bells
							<ArrowRight size={14} aria-hidden="true" />
						</button>
					</div>
					<div className={styles.featuredGrid}>
						{featuredBells.map((bell) => (
							<button
								key={bell.id}
								type="button"
								className={styles.featuredCard}
								aria-label={
									bell.artist
										? `${bell.title} by ${bell.artist}, ${bell.county} County`
										: `${bell.title}, ${bell.county} County`
								}
								onClick={() => handleFeaturedSelect(bell.id)}
							>
								<div className={styles.featuredMediaFrame}>
									<ImagePlaceholder
										src={getBellMediumUrl(bell.imageUrl)}
										alt=""
										className={styles.featuredMedia}
										errorCode={null}
									/>
								</div>
								<div className={styles.featuredInfo}>
									<div>
										<p className={styles.featuredName}>{bell.title}</p>
										{bell.artist ? (
											<p className={styles.featuredArtist}>by {bell.artist}</p>
										) : null}
										<p className={styles.featuredCounty}>
											{bell.county} County
										</p>
									</div>
									<ArrowRight
										size={16}
										className={styles.featuredArrow}
										aria-hidden="true"
									/>
								</div>
							</button>
						))}
					</div>
				</section>
			) : null}
		</section>
	);
}
