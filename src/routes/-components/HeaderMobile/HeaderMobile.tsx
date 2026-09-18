import type { Bell } from "../../../lib/bells/types";
import { InstallBanner } from "../InstallBanner/InstallBanner";
import { ListHeader } from "../ListHeader/ListHeader";
import styles from "./HeaderMobile.module.css";

type Props = {
	bells: Bell[];
	onBellHover: (bellId: string | null) => void;
	onBellSelect: (bellId: string) => void;
	onInteract?: () => void;
	showInstallBanner?: boolean;
};

export function HeaderMobile({
	bells,
	onBellHover,
	onBellSelect,
	onInteract,
	showInstallBanner = false,
}: Props) {
	return (
		<>
			<div className={styles.mapHeader}>
				<ListHeader
					bells={bells}
					onBellHover={onBellHover}
					onBellSelect={onBellSelect}
					onInteract={onInteract}
					variant="mobileMap"
				/>
			</div>
			{showInstallBanner ? <InstallBanner variant="map" /> : null}
		</>
	);
}
