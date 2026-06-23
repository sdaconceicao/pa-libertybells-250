import { createContext, useContext, type ReactNode } from "react";
import { useSession } from "./auth-client";
import type { User } from "better-auth";

type AuthContextValue = {
	isAuthed: boolean;
	user: User | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthContextProvider({ children }: { children: ReactNode }) {
	const { data: session } = useSession();
	const userId = session?.user.id ?? null;
	const isAuthed = !!userId;
	const user = session?.user ?? null;

	return (
		<AuthContext.Provider value={{ isAuthed, user }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthContextProvider");
	}
	return context;
}
