import { Building2, Trees } from "lucide-react";
import type { BellPlacement } from "../../../../../../lib/bells/types";
import styles from "./PlacementIcon.module.css";

type Props = {
	placement: BellPlacement;
};

export function PlacementIcon({ placement }: Props) {
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
