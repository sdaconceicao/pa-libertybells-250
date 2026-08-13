import { Button, TextField } from "@code-x/lago";
import { type FormEvent, useState } from "react";
import { signIn, signUp } from "../../../lib/auth/authClient";
import { FacebookIcon, GoogleIcon } from "#/components/Icons";
import styles from "./AccountMenu.module.css";

type Mode = "login" | "register";

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
					<TextField
						label="Name"
						type="text"
						autoComplete="name"
						isRequired
						value={name}
						onChange={setName}
					/>
				) : null}

				<TextField
					label="Email"
					type="email"
					autoComplete="email"
					isRequired
					value={email}
					onChange={setEmail}
				/>

				<TextField
					label="Password"
					type="password"
					autoComplete={mode === "login" ? "current-password" : "new-password"}
					isRequired
					minLength={8}
					value={password}
					onChange={setPassword}
				/>

				{error ? (
					<p className={styles.error} role="alert">
						{error}
					</p>
				) : null}

				<Button
					type="submit"
					className={styles.submitButton}
					isDisabled={pending}
				>
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
					{GoogleIcon}
					<span>Continue with Google</span>
				</button>
				<button
					type="button"
					className={styles.socialButton}
					onClick={() => handleSocial("facebook")}
					disabled={pending}
				>
					{FacebookIcon}
					<span>Continue with Facebook</span>
				</button>
			</div>
		</div>
	);
}
