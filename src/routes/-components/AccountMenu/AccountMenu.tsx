import { User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { signOut, useAuth } from "../../../lib/auth/authClient";
import { AuthForm } from "./AuthForm";
import styles from "./AccountMenu.module.css";
import { getInitials } from "./getInitials";

export function AccountMenu() {
	const { isPending, user, isAuthed } = useAuth();
	const [open, setOpen] = useState(false);
	const [signingOut, setSigningOut] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// Close on outside click or Escape.
	useEffect(() => {
		if (!open) return;

		function handlePointer(event: MouseEvent) {
			if (!containerRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		}
		function handleKey(event: KeyboardEvent) {
			if (event.key === "Escape") setOpen(false);
		}

		document.addEventListener("mousedown", handlePointer);
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("mousedown", handlePointer);
			document.removeEventListener("keydown", handleKey);
		};
	}, [open]);

	async function handleSignOut() {
		setSigningOut(true);
		await signOut();
		setSigningOut(false);
		setOpen(false);
	}

	const initials = getInitials(user?.name, user?.email);

	return (
		<div ref={containerRef} className={styles.container}>
			<button
				type="button"
				className={[styles.trigger, isAuthed ? styles.triggerAuthed : ""]
					.filter(Boolean)
					.join(" ")}
				aria-haspopup="dialog"
				aria-expanded={open}
				aria-label={isAuthed ? "Account menu" : "Log in or register"}
				onClick={() => setOpen((value) => !value)}
			>
				{isAuthed ? (
					user?.image ? (
						<img className={styles.avatarImage} src={user.image} alt="" />
					) : (
						<span className={styles.initials}>{initials}</span>
					)
				) : (
					<User size={20} strokeWidth={2} aria-hidden="true" />
				)}
			</button>

			{open ? (
				<div className={styles.popover} role="dialog" aria-label="Account">
					{isAuthed ? (
						<div className={styles.account}>
							<div className={styles.accountHeader}>
								<span className={styles.accountAvatar}>{initials}</span>
								<div className={styles.accountText}>
									{user?.name ? (
										<span className={styles.accountName}>{user.name}</span>
									) : null}
									<span className={styles.accountEmail}>{user?.email}</span>
								</div>
							</div>
							<button
								type="button"
								className={styles.signOut}
								onClick={handleSignOut}
								disabled={signingOut}
							>
								{signingOut ? "Signing out…" : "Sign out"}
							</button>
						</div>
					) : isPending ? (
						<p className={styles.loading}>Loading…</p>
					) : (
						<AuthForm onSuccess={() => setOpen(false)} />
					)}
				</div>
			) : null}
		</div>
	);
}
