import { Avatar } from "@code-x/lago";
import { useEffect, useRef, useState } from "react";
import { signOut, useAuth } from "../../../lib/auth/authClient";
import { AuthForm } from "./AuthForm";
import styles from "./AccountMenu.module.css";

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

	// Avatar draws its own initials from either a display name or an email
	// address, and falls back to a person icon when it is given neither — which
	// is exactly the signed-out trigger.
	const accountName = isAuthed ? user?.name?.trim() || user?.email : undefined;
	const accountImage = isAuthed ? (user?.image ?? undefined) : undefined;

	return (
		<div ref={containerRef} className={styles.container}>
			<button
				type="button"
				className={styles.trigger}
				aria-haspopup="dialog"
				aria-expanded={open}
				aria-label={isAuthed ? "Account menu" : "Log in or register"}
				onClick={() => setOpen((value) => !value)}
			>
				<Avatar
					className={styles.avatar}
					src={accountImage}
					name={accountName}
					alt=""
					size="lg"
				/>
			</button>

			{open ? (
				<div className={styles.popover} role="dialog" aria-label="Account">
					{isAuthed ? (
						<div className={styles.account}>
							<div className={styles.accountHeader}>
								<Avatar
									src={accountImage}
									name={accountName}
									alt=""
									size="md"
								/>
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
