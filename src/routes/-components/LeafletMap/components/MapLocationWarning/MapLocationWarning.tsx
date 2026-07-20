import { MapPinOff, X } from "lucide-react";
import styles from "./MapLocationWarning.module.css";

type Props = {
	message: string | null;
	onDismiss: () => void;
};

/** Dismissible alert shown when centering on the visitor's location fails. */
export function MapLocationWarning({ message, onDismiss }: Props) {
	if (!message) {
		return null;
	}

	return (
		<aside className={styles.locationWarning} role="alert">
			<MapPinOff
				className={styles.locationWarningIcon}
				size={18}
				aria-hidden="true"
			/>
			<p className={styles.locationWarningMessage}>{message}</p>
			<button
				type="button"
				className={styles.locationWarningDismiss}
				onClick={onDismiss}
				aria-label="Dismiss location warning"
			>
				<X size={16} aria-hidden="true" />
			</button>
		</aside>
	);
}
