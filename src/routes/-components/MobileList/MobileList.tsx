import type { ReactNode } from "react";
import type { Bell } from "../../../lib/bells/types";
import { BellsList } from "../BellsList/BellsList";
import { InstallBanner } from "../InstallBanner/InstallBanner";
import { ListHeader } from "../ListHeader/ListHeader";
import styles from "./MobileList.module.css";

type Props = {
	bells: Bell[];
	emptyMessage: string;
	onBellHover: (bellId: string | null) => void;
	onBellSelect: (bellId: string) => void;
	selectedContent: ReactNode | null;
	filtersPanel: ReactNode;
	showInstallBanner?: boolean;
};

export function MobileList({
	bells,
	emptyMessage,
	onBellHover,
	onBellSelect,
	selectedContent,
	filtersPanel,
	showInstallBanner = false,
}: Props) {
	return (
		<section className={styles.mobileListLayer}>
			<header className={styles.mobileListHeader}>
				<ListHeader
					bells={bells}
					onBellHover={onBellHover}
					onBellSelect={onBellSelect}
					variant="mobile"
				/>
			</header>
			{showInstallBanner ? <InstallBanner variant="list" /> : null}
			<div className={styles.panelStack}>
				{selectedContent ? (
					<div className={styles.selectedBellSection}>{selectedContent}</div>
				) : (
					filtersPanel
				)}
				<BellsList
					bells={bells}
					className={styles.mobileList}
					emptyMessage={emptyMessage}
					onBellHover={onBellHover}
					onBellSelect={onBellSelect}
				/>
			</div>
		</section>
	);
}
