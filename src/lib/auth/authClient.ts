import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;

export const useAuth = () => {
	const { data: session, isPending } = useSession();
	const user = session?.user ?? null;
	return { isAuthed: !!user?.id, user, isPending };
};
