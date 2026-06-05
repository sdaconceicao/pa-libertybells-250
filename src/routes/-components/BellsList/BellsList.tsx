import type { Bell } from "../../../lib/bells/types";
import { BellContent } from "../BellContent/BellContent";
import styles from "./BellsList.module.css";

type Props = {
	bells: Bell[];
	className?: string;
	emptyMessage?: string;
	onBellHover?: (bellId: string | null) => void;
	onBellSelect?: (bellId: string) => void;
};

export function BellsList({
	bells,
	className,
	emptyMessage = "No bells are loaded yet.",
	onBellHover,
	onBellSelect,
}: Props) {
	const asideClassName = [styles.bellsList, className]
		.filter(Boolean)
		.join(" ");

	return (
		<aside className={asideClassName}>
			{bells.map((bell) => (
				<BellContent
					key={bell.id}
					bell={bell}
					onHover={onBellHover}
					onSelect={onBellSelect}
				/>
			))}
			{bells.length === 0 ? (
				<p className={styles.emptyMessage}>{emptyMessage}</p>
			) : null}
		</aside>
	);
}
