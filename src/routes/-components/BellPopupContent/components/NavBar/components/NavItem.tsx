import styles from "./NavItem.module.css";

type Props = {
	position: number;
	total: number;
};

export function NavItem({ position, total }: Props) {
	if (total <= 0) {
		return null;
	}

	return (
		<span className={styles.navItem} aria-live="polite">
			{position} of {total} bells
		</span>
	);
}
