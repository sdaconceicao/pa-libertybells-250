import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useRef } from "react";
import type { Bell } from "../../../lib/bells/types";
import { BellContent } from "../BellContent/BellContent";
import styles from "./BellsList.module.css";

/** Matches BellContent row: 0.5rem padding × 2 + 2.5rem thumbnail. */
const ROW_ESTIMATE_HEIGHT = 56;
const ROW_OVERSCAN = 8;

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
	const parentRef = useRef<HTMLElement>(null);
	const getScrollElement = useCallback(() => parentRef.current, []);

	const rowVirtualizer = useVirtualizer({
		count: bells.length,
		getScrollElement,
		estimateSize: () => ROW_ESTIMATE_HEIGHT,
		overscan: ROW_OVERSCAN,
	});

	const asideClassName = [styles.bellsList, className]
		.filter(Boolean)
		.join(" ");

	if (bells.length === 0) {
		return (
			<aside className={asideClassName}>
				<p className={styles.emptyMessage}>{emptyMessage}</p>
			</aside>
		);
	}

	const virtualRows = rowVirtualizer.getVirtualItems();

	return (
		<aside ref={parentRef} className={asideClassName}>
			<div
				className={styles.virtualList}
				style={{ height: rowVirtualizer.getTotalSize() }}
			>
				{virtualRows.map((virtualRow) => {
					const bell = bells[virtualRow.index];
					return (
						<div
							key={bell.id}
							ref={rowVirtualizer.measureElement}
							data-index={virtualRow.index}
							className={styles.virtualRow}
							style={{ transform: `translateY(${virtualRow.start}px)` }}
						>
							<BellContent
								bell={bell}
								onHover={onBellHover}
								onSelect={onBellSelect}
							/>
						</div>
					);
				})}
			</div>
		</aside>
	);
}
