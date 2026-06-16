import type { ReactNode } from "react";
import type { Bell } from "../../../lib/bells/types";
import { BellsList } from "../BellsList/BellsList";
import styles from "./BellsPanelContent.module.css";

export type FiltersPlacement = "replace" | "stack";

type Props = {
	bells: Bell[];
	emptyMessage: string;
	onBellHover: (bellId: string | null) => void;
	onBellSelect: (bellId: string) => void;
	selectedContent: ReactNode | null;
	filtersPanel: ReactNode;
	filtersPlacement: FiltersPlacement;
	listVariant?: "default" | "mobile";
};

export function BellsPanelContent({
	bells,
	emptyMessage,
	onBellHover,
	onBellSelect,
	selectedContent,
	filtersPanel,
	filtersPlacement,
	listVariant = "default",
}: Props) {
	const showFilters = filtersPlacement === "stack" || !selectedContent;
	const listClassName = [
		styles.list,
		listVariant === "mobile" ? styles.listMobile : "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={styles.panelStack}>
			{selectedContent ? (
				<div className={styles.selectedSection}>{selectedContent}</div>
			) : null}
			{showFilters ? filtersPanel : null}
			<BellsList
				bells={bells}
				className={listClassName}
				emptyMessage={emptyMessage}
				onBellHover={onBellHover}
				onBellSelect={onBellSelect}
			/>
		</div>
	);
}
