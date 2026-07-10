import type { ReactNode } from "react";
import { CloseButton } from "../../../components/CloseButton/CloseButton";
import { Image } from "../../../components/Image/Image";
import { AddressIcon } from "../AddressIcon/AddressIcon";
import { ArtistIcon } from "../ArtistIcon/ArtistIcon";
import {
	buildAddressLines,
	buildAddressString,
	buildMapsUrl,
} from "../../../lib/bells/bellAddress";
import { getBellMediumUrl } from "../../../lib/bells/bellImageVariants";
import type { Bell } from "../../../lib/bells/types";
import styles from "./BellPopupContent.module.css";
import { MetaBar } from "./components/MetaBar/MetaBar";
import { NavBar } from "./components/NavBar/NavBar";

type Props = {
	bell: Bell;
	variant?: "popup" | "sidebar";
	onClose?: () => void;
	onPrevious?: () => void;
	onNext?: () => void;
	hasPrevious?: boolean;
	hasNext?: boolean;
	listPosition?: number | null;
	listTotal?: number;
	/**
	 * Optional control (e.g. the visit-status dropdown) rendered in the header
	 * band, between the navigation cluster and the close button.
	 */
	actions?: ReactNode;
};

export function BellPopupContent({
	bell,
	variant = "popup",
	onClose,
	onPrevious,
	onNext,
	hasPrevious = false,
	hasNext = false,
	listPosition = null,
	listTotal = 0,
	actions,
}: Props) {
	const rootClassName = [
		styles.popup,
		variant === "sidebar" ? styles.popupSidebar : "",
	]
		.filter(Boolean)
		.join(" ");
	const addressLines = buildAddressLines(bell.address);
	const mapsUrl = buildMapsUrl(bell.lat, bell.lng, bell.address);
	const showNavigation = onPrevious != null || onNext != null;

	return (
		<div className={rootClassName} data-testid="bell-popup">
			<div className={styles.header}>
				{actions ? <div className={styles.headerStatus}>{actions}</div> : null}
				{onClose ? (
					<CloseButton
						variant="overlay"
						onClick={onClose}
						label="Close selected bell"
					/>
				) : null}
				<Image
					src={getBellMediumUrl(bell.imageUrl)}
					alt=""
					className={styles.headerMedia}
					imageClassName={styles.headerImage}
					placeholderClassName={styles.headerPlaceholder}
				/>
				<MetaBar
					nav={
						showNavigation ? (
							<NavBar
								onPrevious={onPrevious}
								onNext={onNext}
								hasPrevious={hasPrevious}
								hasNext={hasNext}
								listPosition={listPosition}
								listTotal={listTotal}
							/>
						) : null
					}
				/>
			</div>
			<div className={styles.body}>
				<h3 className={styles.title}>{bell.title}</h3>
				{bell.artist ? (
					<p className={styles.artist}>
						<ArtistIcon />
						<span>by {bell.artist}</span>
					</p>
				) : null}
				{addressLines.length > 0 ? (
					<a
						href={mapsUrl}
						className={styles.address}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={`Open ${buildAddressString(bell.address)} in maps`}
					>
						<AddressIcon placement={bell.placement} />
						<span className={styles.addressText}>
							{addressLines.map((line) => (
								<span key={line} className={styles.addressLine}>
									{line}
								</span>
							))}
						</span>
					</a>
				) : null}
			</div>
		</div>
	);
}
