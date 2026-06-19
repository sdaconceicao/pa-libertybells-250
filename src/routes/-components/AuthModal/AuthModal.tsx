import { X } from "lucide-react";
import { useEffect } from "react";
import { AuthForm } from "../AccountMenu/AuthForm";
import { CloseButton } from "#/components/CloseButton/CloseButton";
import styles from "./AuthModal.module.css";

export function AuthModal({ onClose }: { onClose: () => void }) {
	useEffect(() => {
		function handleKey(event: KeyboardEvent) {
			if (event.key === "Escape") onClose();
		}
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [onClose]);

	return (
		<div className={styles.backdrop}>
			<button
				type="button"
				className={styles.backdropButton}
				aria-label="Close"
				tabIndex={-1}
				onClick={onClose}
			/>
			<div
				className={styles.dialog}
				role="dialog"
				aria-modal="true"
				aria-label="Log in or register"
			>
				<CloseButton
					className={styles.close}
					aria-label="Close"
					onClick={onClose}
				/>
				<div className={styles.intro}>
					<h2 className={styles.title}>Sign in to save bells</h2>
					<p className={styles.subtitle}>
						Track the bells you want to visit and the ones you’ve been to.
					</p>
				</div>
				<AuthForm onSuccess={onClose} />
			</div>
		</div>
	);
}
