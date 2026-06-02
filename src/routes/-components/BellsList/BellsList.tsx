import type { Bell } from "../../../lib/bells/types";
import { BellContent } from "../BellContent/BellContent";
import styles from "./BellsList.module.css";

type Props = {
	bells: Bell[];
	className?: string;
	emptyMessage?: string;
};

export function BellsList({
	bells,
	className,
	emptyMessage = "No bells are loaded yet.",
}: Props) {
	const asideClassName = [styles.bellsList, className]
		.filter(Boolean)
		.join(" ");

	return (
		<aside className={asideClassName}>
			{bells.map((bell) => (
				<BellContent key={bell.id} bell={bell} />
			))}
			{bells.length === 0 ? (
				<p className={styles.emptyMessage}>{emptyMessage}</p>
			) : null}
		</aside>
	);
}
