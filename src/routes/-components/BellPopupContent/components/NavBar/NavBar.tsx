import styles from "./NavBar.module.css";
import { NavButton } from "./components/NavButton";
import { NavItem } from "./components/NavItem";

type Props = {
	onPrevious?: () => void;
	onNext?: () => void;
	hasPrevious?: boolean;
	hasNext?: boolean;
	listPosition?: number | null;
	listTotal?: number;
};

export function NavBar({
	onPrevious,
	onNext,
	hasPrevious = false,
	hasNext = false,
	listPosition = null,
	listTotal = 0,
}: Props) {
	const showNavigation = onPrevious != null || onNext != null;

	if (!showNavigation) {
		return null;
	}

	return (
		<div className={styles.navBar}>
			<NavButton
				direction="previous"
				onClick={onPrevious}
				disabled={!hasPrevious}
			/>
			{listPosition != null ? (
				<NavItem position={listPosition} total={listTotal} />
			) : null}
			<NavButton direction="next" onClick={onNext} disabled={!hasNext} />
		</div>
	);
}
