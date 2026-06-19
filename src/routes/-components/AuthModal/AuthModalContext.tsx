import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { AuthModal } from "./AuthModal";

type AuthModalContextValue = {
	isOpen: boolean;
	openAuthModal: () => void;
	closeAuthModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);

	const openAuthModal = useCallback(() => setIsOpen(true), []);
	const closeAuthModal = useCallback(() => setIsOpen(false), []);

	const value = useMemo(
		() => ({ isOpen, openAuthModal, closeAuthModal }),
		[isOpen, openAuthModal, closeAuthModal],
	);

	return (
		<AuthModalContext.Provider value={value}>
			{children}
			{isOpen ? <AuthModal onClose={closeAuthModal} /> : null}
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
