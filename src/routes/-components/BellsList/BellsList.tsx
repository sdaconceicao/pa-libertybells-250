import { useEffect, useState } from "react";
import type { Bell } from "../../../lib/bells/types";
import { BellContent } from "../BellContent/BellContent";
import styles from "./BellsList.module.css";
import { useVirtualListRange } from "./useVirtualListRange";

/** Matches BellContent row: 0.5rem padding × 2 + 2.5rem thumbnail. */
const ROW_HEIGHT = 56;
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
	const [mounted, setMounted] = useState(false);
	const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	const { start, end } = useVirtualListRange({
		itemCount: mounted ? bells.length : 0,
		itemHeight: ROW_HEIGHT,
		overscan: ROW_OVERSCAN,
		scrollElement,
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

	const totalHeight = bells.length * ROW_HEIGHT;
	const visibleBells = mounted ? bells.slice(start, end) : [];

	return (
		<aside
			ref={setScrollElement}
			className={asideClassName}
		>
			<div
				className={styles.virtualList}
				style={{ height: mounted ? totalHeight : 0 }}
			>
				{visibleBells.map((bell, index) => {
					const itemIndex = start + index;
					return (
						<div
							key={bell.id}
							className={styles.virtualRow}
							style={{
								height: ROW_HEIGHT,
								transform: `translateY(${itemIndex * ROW_HEIGHT}px)`,
							}}
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
