import { Building2, Trees, X } from "lucide-react";
import { buildAddressLines } from "../../../lib/bells/bellAddress";
import type { Bell, BellPlacement } from "../../../lib/bells/types";
import styles from "./BellPopupContent.module.css";

type Props = {
	bell: Bell;
	variant?: "popup" | "sidebar";
	onClose?: () => void;
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
}: Props) {
	const rootClassName = [
		styles.popup,
		variant === "sidebar" ? styles.popupSidebar : "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={rootClassName} data-testid="bell-popup">
			<div className={styles.header}>
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
				{bell.imageUrl ? (
					<img src={bell.imageUrl} alt="" className={styles.headerImage} />
				) : (
					<div className={styles.headerPlaceholder} aria-hidden="true" />
				)}
				<div className={styles.metaBar}>
					{bell.placement ? <PlacementIcon placement={bell.placement} /> : null}
				</div>
			</div>
			<div className={styles.body}>
				<h3 className={styles.title}>{bell.title}</h3>
				{bell.artist ? <p className={styles.artist}>by {bell.artist}</p> : null}
				<p className={styles.address}>
					{buildAddressLines(bell.address).map((line) => (
						<span key={line} className={styles.addressLine}>
							{line}
						</span>
					))}
				</p>
			</div>
		</div>
	);
}
