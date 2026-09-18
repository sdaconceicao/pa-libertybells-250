import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { AuthModal } from "./AuthModal";

export type AuthModalMode = "login" | "register";

type AuthModalContextValue = {
	isOpen: boolean;
	openAuthModal: (mode?: AuthModalMode) => void;
	closeAuthModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);
	const [mode, setMode] = useState<AuthModalMode>("login");

	const openAuthModal = useCallback((nextMode: AuthModalMode = "login") => {
		setMode(nextMode);
		setIsOpen(true);
	}, []);
	const closeAuthModal = useCallback(() => setIsOpen(false), []);

	const value = useMemo(
		() => ({ isOpen, openAuthModal, closeAuthModal }),
		[isOpen, openAuthModal, closeAuthModal],
	);

	return (
		<AuthModalContext.Provider value={value}>
			{children}
			{isOpen ? (
				<AuthModal onClose={closeAuthModal} initialMode={mode} />
			) : null}
		</AuthModalContext.Provider>
	);
}

const FALLBACK: AuthModalContextValue = {
	isOpen: false,
	openAuthModal: () => {},
	closeAuthModal: () => {},
};

export function useAuthModal(): AuthModalContextValue {
	return useContext(AuthModalContext) ?? FALLBACK;
}
