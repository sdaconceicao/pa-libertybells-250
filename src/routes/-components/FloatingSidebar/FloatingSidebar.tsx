import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import type { Bell } from "../../../lib/bells/types";
import { BellsPanelContent } from "../BellsPanelContent/BellsPanelContent";
import { ListHeader } from "../ListHeader/ListHeader";
import styles from "./FloatingSidebar.module.css";

type Props = {
	isOpen: boolean;
	onClose: () => void;
	onOpen: () => void;
	bells: Bell[];
	emptyMessage: string;
	onBellHover: (bellId: string | null) => void;
	onBellSelect: (bellId: string) => void;
	selectedContent: ReactNode | null;
	filtersPanel: ReactNode;
};

export function FloatingSidebar({
	isOpen,
	onClose,
	onOpen,
	bells,
	emptyMessage,
	onBellHover,
	onBellSelect,
	selectedContent,
	filtersPanel,
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
				emptyMessage={emptyMessage}
				onBellHover={onBellHover}
				onBellSelect={onBellSelect}
				selectedContent={selectedContent}
				filtersPanel={filtersPanel}
				filtersPlacement="stack"
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
