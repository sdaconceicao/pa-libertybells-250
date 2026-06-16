import type { ReactNode } from "react";
import type { Bell } from "../../../lib/bells/types";
import { BellsPanelContent } from "../BellsPanelContent/BellsPanelContent";
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
			<BellsPanelContent
				bells={bells}
				emptyMessage={emptyMessage}
				onBellHover={onBellHover}
				onBellSelect={onBellSelect}
				selectedContent={selectedContent}
				filtersPanel={filtersPanel}
				filtersPlacement="replace"
				listVariant="mobile"
			/>
		</section>
	);
}
