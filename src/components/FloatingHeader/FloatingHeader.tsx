import styles from "./FloatingHeader.module.css";

type Props = {
	bellCount: number;
	sidebarOpen: boolean;
	isMobile: boolean;
};

export function FloatingHeader({ bellCount, sidebarOpen, isMobile }: Props) {
	const headerClassName = [
		styles.header,
		!isMobile && sidebarOpen ? styles.headerSidebarOpen : "",
		!isMobile && !sidebarOpen ? styles.headerSidebarClosed : "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<header className={headerClassName}>
			<div className={styles.logoGroup}>
				<span className={styles.logoMark} aria-hidden="true">
					&#128276;
				</span>
				<h1 className={styles.logoText}>Bells Across PA</h1>
			</div>
			<p className={styles.count}>{bellCount} bells mapped</p>
		</header>
	);
}
