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
	/** Open the login/register modal. */
	openAuthModal: () => void;
	/** Close the login/register modal. */
	closeAuthModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

/**
 * Provides a single app-wide login/register modal that any component can open
 * (e.g. when a signed-out user tries to save a bell). The modal is rendered
 * here so it overlays the whole app rather than being trapped inside a popover.
 */
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

/**
 * Read the auth-modal context. Falls back to a no-op when rendered outside a
 * provider so components that open the modal can still be rendered in isolation.
 */
export function useAuthModal(): AuthModalContextValue {
	return useContext(AuthModalContext) ?? FALLBACK;
}
