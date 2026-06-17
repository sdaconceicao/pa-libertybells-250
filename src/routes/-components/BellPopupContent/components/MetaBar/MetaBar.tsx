import type { ReactNode } from "react";
import type { BellPlacement } from "../../../../../lib/bells/types";
import styles from "./MetaBar.module.css";
import { PlacementIcon } from "./components/PlacementIcon";

type Props = {
	placement?: BellPlacement;
	/** Navigation controls, rendered at the start of the bar. */
	nav?: ReactNode;
};

export function MetaBar({ placement, nav }: Props) {
	if (!placement && !nav) {
		return null;
	}

	return (
		<div className={styles.metaBar}>
			<div className={styles.nav}>{nav}</div>
			<div className={styles.placement}>
				{placement ? <PlacementIcon placement={placement} /> : null}
			</div>
		</div>
	);
}
