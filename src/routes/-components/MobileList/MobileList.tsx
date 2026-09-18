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
	onInteract?: () => void;
};

export function MobileList({
	bells,
	onBellHover,
	onBellSelect,
	onInteract,
	showInstallBanner = false,
	...panelProps
}: Props) {
	return (
		<section
			className={styles.mobileListLayer}
			onPointerDownCapture={onInteract}
		>
			<header className={styles.mobileListHeader}>
				<ListHeader
					bells={bells}
					onBellHover={onBellHover}
					onBellSelect={onBellSelect}
					onInteract={onInteract}
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
