import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./NavButton.module.css";

type Props = {
	direction: "previous" | "next";
	onClick?: () => void;
	disabled?: boolean;
};

export function NavButton({ direction, onClick, disabled = false }: Props) {
	const isPrevious = direction === "previous";
	const Icon = isPrevious ? ChevronLeft : ChevronRight;
	const label = isPrevious ? "Previous bell" : "Next bell";

	return (
		<button
			type="button"
			className={styles.navButton}
			onClick={onClick}
			disabled={disabled}
			aria-label={label}
		>
			<Icon size={16} aria-hidden="true" />
		</button>
	);
}
