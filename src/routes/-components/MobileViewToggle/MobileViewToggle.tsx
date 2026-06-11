import { List, Map as MapIcon } from "lucide-react";
import type { MobileView } from "../../-hooks/useBellsPageLayout";
import styles from "./MobileViewToggle.module.css";

type Props = {
	activeView: MobileView;
	onShowMap: () => void;
	onShowList: () => void;
};

export function MobileViewToggle({ activeView, onShowMap, onShowList }: Props) {
	const toggleBarClassName = [
		styles.toggleBar,
		activeView === "list" ? styles.toggleBarList : styles.toggleBarMap,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={toggleBarClassName} role="tablist" aria-label="View mode">
			<button
				type="button"
				role="tab"
				className={[
					styles.toggleButton,
					activeView === "map" ? styles.toggleButtonActive : "",
				]
					.filter(Boolean)
					.join(" ")}
				onClick={onShowMap}
				aria-selected={activeView === "map"}
			>
				<MapIcon size={14} aria-hidden="true" />
				Map
			</button>
			<button
				type="button"
				role="tab"
				className={[
					styles.toggleButton,
					activeView === "list" ? styles.toggleButtonActive : "",
				]
					.filter(Boolean)
					.join(" ")}
				onClick={onShowList}
				aria-selected={activeView === "list"}
			>
				<List size={14} aria-hidden="true" />
				List
			</button>
		</div>
	);
}
