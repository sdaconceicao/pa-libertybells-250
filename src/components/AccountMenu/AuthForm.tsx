import { type FormEvent, useState } from "react";
import { Button } from "../Button/Button";
import { signIn, signUp } from "../../lib/auth/auth-client";
import styles from "./AccountMenu.module.css";

type Mode = "login" | "register";

const GOOGLE_ICON = (
	<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
		<path
			fill="#4285F4"
			d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
		/>
		<path
			fill="#34A853"
			d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18Z"
		/>
		<path
			fill="#FBBC05"
			d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34Z"
		/>
		<path
			fill="#EA4335"
			d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
		/>
	</svg>
);

const FACEBOOK_ICON = (
	<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
		<path
			fill="#1877F2"
			d="M18 9a9 9 0 1 0-10.41 8.89v-6.29H5.31V9h2.28V7.02c0-2.25 1.34-3.5 3.4-3.5.98 0 2.01.18 2.01.18v2.22h-1.13c-1.12 0-1.47.69-1.47 1.4V9h2.5l-.4 2.6h-2.1v6.29A9 9 0 0 0 18 9Z"
		/>
	</svg>
);

export function AuthForm({ onSuccess }: { onSuccess?: () => void }) {
	const [mode, setMode] = useState<Mode>("login");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		setError(null);
		setPending(true);

		const result =
			mode === "login"
				? await signIn.email({ email, password })
				: await signUp.email({ email, password, name });

		setPending(false);

		if (result.error) {
			setError(
				result.error.message ?? "Something went wrong. Please try again.",
			);
			return;
		}

		onSuccess?.();
	}

	async function handleSocial(provider: "google" | "facebook") {
		setError(null);
		setPending(true);
		const result = await signIn.social({ provider, callbackURL: "/" });
		if (result?.error) {
			setPending(false);
			setError(
				result.error.message ?? "Could not start sign-in. Please try again.",
			);
		}
		// On success the browser is redirected to the provider, so no further work.
	}

	return (
		<div className={styles.authForm}>
			<div className={styles.tabs} role="tablist">
				<button
					type="button"
					role="tab"
					aria-selected={mode === "login"}
					className={[styles.tab, mode === "login" ? styles.tabActive : ""]
						.filter(Boolean)
						.join(" ")}
					onClick={() => {
						setMode("login");
						setError(null);
					}}
				>
					Log in
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={mode === "register"}
					className={[styles.tab, mode === "register" ? styles.tabActive : ""]
						.filter(Boolean)
						.join(" ")}
					onClick={() => {
						setMode("register");
						setError(null);
					}}
				>
					Register
				</button>
			</div>

			<form className={styles.form} onSubmit={handleSubmit}>
				{mode === "register" ? (
					<label className={styles.field}>
						<span className={styles.label}>Name</span>
						<input
							className={styles.input}
							type="text"
							autoComplete="name"
							required
							value={name}
							onChange={(event) => setName(event.target.value)}
						/>
					</label>
				) : null}

				<label className={styles.field}>
					<span className={styles.label}>Email</span>
					<input
						className={styles.input}
						type="email"
						autoComplete="email"
						required
						value={email}
						onChange={(event) => setEmail(event.target.value)}
					/>
				</label>

				<label className={styles.field}>
					<span className={styles.label}>Password</span>
					<input
						className={styles.input}
						type="password"
						autoComplete={
							mode === "login" ? "current-password" : "new-password"
						}
						required
						minLength={8}
						value={password}
						onChange={(event) => setPassword(event.target.value)}
					/>
				</label>

				{error ? (
					<p className={styles.error} role="alert">
						{error}
					</p>
				) : null}

				<Button type="submit" fullWidth disabled={pending}>
					{pending
						? "Please wait…"
						: mode === "login"
							? "Log in"
							: "Create account"}
				</Button>
			</form>

			<div className={styles.divider}>
				<span>or</span>
			</div>

			<div className={styles.social}>
				<button
					type="button"
					className={styles.socialButton}
					onClick={() => handleSocial("google")}
					disabled={pending}
				>
					{GOOGLE_ICON}
					<span>Continue with Google</span>
				</button>
				<button
					type="button"
					className={styles.socialButton}
					onClick={() => handleSocial("facebook")}
					disabled={pending}
				>
					{FACEBOOK_ICON}
					<span>Continue with Facebook</span>
				</button>
			</div>
		</div>
	);
}
