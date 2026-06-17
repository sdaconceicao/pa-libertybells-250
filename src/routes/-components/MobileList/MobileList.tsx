import type { BellsPanelContentProps } from "../BellsPanelContent/BellsPanelContent";
import { BellsPanelContent } from "../BellsPanelContent/BellsPanelContent";
import { InstallBanner } from "../InstallBanner/InstallBanner";
import { ListHeader } from "../ListHeader/ListHeader";
import styles from "./MobileList.module.css";

type Props = Omit<
	BellsPanelContentProps,
	"filtersPlacement" | "listVariant"
> & {
	showInstallBanner?: boolean;
};

export function MobileList({
	bells,
	onBellHover,
	onBellSelect,
	showInstallBanner = false,
	...panelProps
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
				onBellHover={onBellHover}
				onBellSelect={onBellSelect}
				filtersPlacement="replace"
				listVariant="mobile"
				{...panelProps}
			/>
		</section>
	);
}
