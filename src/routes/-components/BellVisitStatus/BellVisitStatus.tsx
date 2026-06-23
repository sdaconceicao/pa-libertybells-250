import { Bookmark, CircleHelp, MapPin } from "lucide-react";
import { useState } from "react";
import { useVisitStatuses } from "../../../lib/visits/VisitStatusContext";
import type { VisitStatus } from "../../../lib/visits/types";
import { useAuthModal } from "../AuthModal/AuthModalContext";
import { Select, type SelectOption } from "../../../components/Select/Select";
import styles from "./BellVisitStatus.module.css";

const ICON_SIZE = 14;

const OPTIONS: SelectOption<VisitStatus>[] = [
	{
		value: "none",
		label: "Visited?",
		icon: <CircleHelp size={ICON_SIZE} aria-hidden="true" />,
	},
	{
		value: "want",
		label: "Want to go",
		icon: <Bookmark size={ICON_SIZE} aria-hidden="true" />,
	},
	{
		value: "been",
		label: "Been there",
		icon: <MapPin size={ICON_SIZE} aria-hidden="true" />,
	},
];

/**
 * Compact visit-status dropdown for a single bell, sized to sit in the popup
 * header band beside the close and navigation controls. Reads and writes the
 * user's saved status; when signed out it shows the muted "Visited?"
 * placeholder and opens the login modal on interaction.
 */
export function BellVisitStatus({ bellId }: { bellId: string }) {
	const { isAuthed, getStatus, setStatus } = useVisitStatuses();
	const { openAuthModal } = useAuthModal();
	const [pending, setPending] = useState(false);

	const value = isAuthed ? getStatus(bellId) : "none";

	async function handleChange(next: VisitStatus) {
		if (!isAuthed) {
			openAuthModal();
			return;
		}
		setPending(true);
		try {
			await setStatus(bellId, next);
		} catch {
			// State already reverted by the provider; nothing more to do here.
		} finally {
			setPending(false);
		}
	}

	return (
		<Select
			value={value}
			onChange={handleChange}
			options={OPTIONS}
			ariaLabel="Visited status"
			disabled={pending}
			placeholderValue="none"
			className={styles.statusSelect}
		/>
	);
}
