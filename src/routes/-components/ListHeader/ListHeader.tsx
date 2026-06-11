import type { Bell } from "../../../lib/bells/types";
import { BellSearch } from "../BellSearch/BellSearch";
import { Logo } from "../Logo/Logo";
import styles from "./ListHeader.module.css";

type Props = {
	bells: Bell[];
	onBellHover?: (bellId: string | null) => void;
	onBellSelect?: (bellId: string) => void;
	showLogo?: boolean;
	variant?: "desktop" | "mobile" | "mobileMap" | "map";
};

export function ListHeader({
	bells,
	onBellHover,
	onBellSelect,
	showLogo = true,
	variant = "desktop",
}: Props) {
	const headerClassName = [
		styles.header,
		variant === "mobile"
			? styles.mobile
			: variant === "mobileMap"
				? styles.mobileMap
				: variant === "map"
					? styles.map
					: styles.desktop,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={headerClassName}>
			{showLogo ? <Logo variant="circle" className={styles.logo} /> : null}
			<BellSearch
				bells={bells}
				className={styles.search}
				onBellHover={onBellHover}
				onBellSelect={onBellSelect}
			/>
		</div>
	);
}
