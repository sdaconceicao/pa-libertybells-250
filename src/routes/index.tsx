import { createFileRoute } from "@tanstack/react-router";
import bellsData from "../lib/bells/bells.data.json";
import type { Bell } from "../lib/bells/types";
import { BellsList } from "../components/BellsList/BellsList";
import { BellsMap } from "../components/BellsMap";
import styles from "./index.module.css";

export const Route = createFileRoute("/")({
	loader: async () => {
		// Data is statically generated; just return it typed.
		return bellsData as Bell[];
	},
	component: BellsPage,
});

function BellsPage() {
	const bells = Route.useLoaderData();

	return (
		<main className={styles.page}>
			<header className={styles.hero}>
				<div className={styles.heroMain}>
					<p className={styles.kicker}>Bells Across Pennsylvania</p>
					<h1 className={styles.heroTitle}>
						Explore the America250 PA Bells Across PA trail
					</h1>
					<p className={styles.heroDesc}>
						Each marker represents a commemorative bell installation across
						Pennsylvania. Click a marker to see its title, county, artist, and
						current location.
					</p>
				</div>
				<div className={styles.countChip}>
					Total bells mapped: {bells.length}
				</div>
			</header>

			<section className={styles.contentRow}>
				<div className={styles.mapArea}>
					<BellsMap bells={bells} />
				</div>

				<BellsList bells={bells} className={styles.sidebar} />
			</section>
		</main>
	);
}
