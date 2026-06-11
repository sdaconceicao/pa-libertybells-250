import { Building2, ChevronLeft, ChevronRight, Trees, X } from "lucide-react";
import { Image } from "../../../components/Image/Image";
import {
	buildAddressLines,
	buildAddressString,
	buildMapsUrl,
} from "../../../lib/bells/bellAddress";
import type { Bell, BellPlacement } from "../../../lib/bells/types";
import styles from "./BellPopupContent.module.css";

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
};

function PlacementIcon({ placement }: { placement: BellPlacement }) {
	const isIndoors = placement === "indoors";
	const Icon = isIndoors ? Building2 : Trees;
	const label = isIndoors ? "Indoor" : "Outdoor";

	return (
		<span
			className={styles.placementIcon}
			role="img"
			title={label}
			aria-label={label}
		>
			<Icon size={16} aria-hidden="true" />
		</span>
	);
}

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
}: Props) {
	const rootClassName = [
		styles.popup,
		variant === "sidebar" ? styles.popupSidebar : "",
	]
		.filter(Boolean)
		.join(" ");
	const showNavigation = onPrevious != null || onNext != null;
	const addressLines = buildAddressLines(bell.address);
	const mapsUrl = buildMapsUrl(bell.lat, bell.lng, bell.address);

	return (
		<div className={rootClassName} data-testid="bell-popup">
			<div className={styles.header}>
				{showNavigation ? (
					<div className={styles.navButtons}>
						<button
							type="button"
							className={styles.navButton}
							onClick={onPrevious}
							disabled={!hasPrevious}
							aria-label="Previous bell"
						>
							<ChevronLeft size={16} aria-hidden="true" />
						</button>
						{listPosition != null && listTotal > 0 ? (
							<span className={styles.navPosition} aria-live="polite">
								{listPosition} of {listTotal} bells
							</span>
						) : null}
						<button
							type="button"
							className={styles.navButton}
							onClick={onNext}
							disabled={!hasNext}
							aria-label="Next bell"
						>
							<ChevronRight size={16} aria-hidden="true" />
						</button>
					</div>
				) : null}
				{onClose ? (
					<button
						type="button"
						className={styles.closeButton}
						onClick={onClose}
						aria-label="Close selected bell"
					>
						<X size={16} aria-hidden="true" />
					</button>
				) : null}
				<Image
					src={bell.imageUrl}
					alt=""
					imageClassName={styles.headerImage}
					placeholderClassName={styles.headerPlaceholder}
				/>
				<div className={styles.metaBar}>
					{bell.placement ? <PlacementIcon placement={bell.placement} /> : null}
				</div>
			</div>
			<div className={styles.body}>
				<h3 className={styles.title}>{bell.title}</h3>
				{bell.artist ? <p className={styles.artist}>by {bell.artist}</p> : null}
				{addressLines.length > 0 ? (
					<a
						href={mapsUrl}
						className={styles.address}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={`Open ${buildAddressString(bell.address)} in maps`}
					>
						{addressLines.map((line) => (
							<span key={line} className={styles.addressLine}>
								{line}
							</span>
						))}
					</a>
				) : null}
			</div>
		</div>
	);
}
