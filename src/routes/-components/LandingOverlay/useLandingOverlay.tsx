import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { useAuth } from "../../../lib/auth/authClient";
import {
	getLandingOverlayStorage,
	readLandingOverlayDismissed,
	writeLandingOverlayDismissed,
} from "./LandingOverlay.utils";

type LandingOverlayState = {
	visible: boolean;
	dismiss: () => void;
};

const LandingOverlayContext = createContext<LandingOverlayState | null>(null);

export function useLandingOverlay(): LandingOverlayState {
	const { isAuthed, isPending } = useAuth();
	const [dismissed, setDismissed] = useState(() =>
		readLandingOverlayDismissed(getLandingOverlayStorage()),
	);

	const dismiss = useCallback(() => {
		writeLandingOverlayDismissed(getLandingOverlayStorage());
		setDismissed(true);
	}, []);

	return {
		visible: !dismissed && !isAuthed && !isPending,
		dismiss,
	};
}

export function LandingOverlayProvider({ children }: { children: ReactNode }) {
	const { visible, dismiss } = useLandingOverlay();
	const value = useMemo(() => ({ visible, dismiss }), [dismiss, visible]);

	return (
		<LandingOverlayContext.Provider value={value}>
			{children}
		</LandingOverlayContext.Provider>
	);
}

const FALLBACK: LandingOverlayState = {
	visible: false,
	dismiss: () => {},
};

export function useLandingOverlayState(): LandingOverlayState {
	return useContext(LandingOverlayContext) ?? FALLBACK;
}
