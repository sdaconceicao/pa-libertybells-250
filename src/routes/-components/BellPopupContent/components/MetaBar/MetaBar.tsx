import type { BellPlacement } from "../../../../../lib/bells/types";
import styles from "./MetaBar.module.css";
import { PlacementIcon } from "./components/PlacementIcon";

type Props = {
	placement?: BellPlacement;
};

export function MetaBar({ placement }: Props) {
	if (!placement) {
		return null;
	}

	return (
		<div className={styles.metaBar}>
			<PlacementIcon placement={placement} />
		</div>
	);
}
