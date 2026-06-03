import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./FloatingSidebar.module.css";

type Props = {
	isOpen: boolean;
	onClose: () => void;
	onOpen: () => void;
	children: ReactNode;
};

export function FloatingSidebar({ isOpen, onClose, onOpen, children }: Props) {
	const sidebarClassName = [
		styles.sidebar,
		isOpen ? styles.sidebarOpen : styles.sidebarClosed,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<aside className={sidebarClassName}>
			<div className={styles.sidebarHeader}>
				<h2 className={styles.sidebarTitle}>Bells Across PA</h2>
			</div>
			<div className={styles.sidebarBody}>{children}</div>
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
