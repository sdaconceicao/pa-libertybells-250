import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BellsPanelContentProps } from "../BellsPanelContent/BellsPanelContent";
import { BellsPanelContent } from "../BellsPanelContent/BellsPanelContent";
import { ListHeader } from "../ListHeader/ListHeader";
import styles from "./FloatingSidebar.module.css";

type Props = Omit<
	BellsPanelContentProps,
	"filtersPlacement" | "listVariant"
> & {
	isOpen: boolean;
	onClose: () => void;
	onOpen: () => void;
};

export function FloatingSidebar({
	isOpen,
	onClose,
	onOpen,
	bells,
	onBellHover,
	onBellSelect,
	...panelProps
}: Props) {
	const sidebarClassName = [
		styles.sidebar,
		isOpen ? styles.sidebarOpen : styles.sidebarClosed,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<aside className={sidebarClassName}>
			{isOpen ? (
				<div className={styles.sidebarHeader}>
					<ListHeader
						bells={bells}
						onBellHover={onBellHover}
						onBellSelect={onBellSelect}
						variant="desktop"
					/>
				</div>
			) : null}
			<BellsPanelContent
				bells={bells}
				onBellHover={onBellHover}
				onBellSelect={onBellSelect}
				filtersPlacement="stack"
				{...panelProps}
			/>
			<button
				type="button"
				className={styles.handle}
				onClick={isOpen ? onClose : onOpen}
				aria-label={isOpen ? "Close bells list" : "Open bells list"}
				aria-expanded={isOpen}
			>
				{isOpen ? (
					<ChevronLeft size={16} aria-hidden="true" />
				) : (
					<ChevronRight size={16} aria-hidden="true" />
				)}
			</button>
		</aside>
	);
}
