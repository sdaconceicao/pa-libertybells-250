import type { Bell } from "../../../lib/bells/types";
import { BellSearch } from "../BellSearch/BellSearch";
import { Logo } from "../Logo/Logo";
import styles from "./HeaderDesktop.module.css";

type Props = {
	bells: Bell[];
	onBellHover: (bellId: string | null) => void;
	onBellSelect: (bellId: string) => void;
};

export function HeaderDesktop({
	bells,
	onBellHover,
	onBellSelect,
}: Props) {
	return (
		<>
			<div className={styles.mapHeader}>
				<BellSearch
					bells={bells}
					onBellHover={onBellHover}
					onBellSelect={onBellSelect}
					className={styles.mapHeaderSearch}
				/>
			</div>
			<Logo variant="circle" className={styles.mapLogo} />
		</>
	);
}
