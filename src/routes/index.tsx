import { createFileRoute } from "@tanstack/react-router";
import bellsData from "../lib/bells/bells.data.json";
import type { Bell } from "../lib/bells/types";
import { BellsMap } from "../components/BellsMap";

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
		<main className="page-wrap px-4 pb-8 pt-14">
			<section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="island-kicker mb-3">Bells Across Pennsylvania</p>
					<h1 className="display-title mb-3 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl">
						Explore the America250PA Bells Across PA trail
					</h1>
					<p className="m-0 max-w-2xl text-sm text-[var(--sea-ink-soft)] sm:text-base">
						Each marker represents a commemorative bell installation across
						Pennsylvania. Click a marker to see its title, county, artist, and
						current location.
					</p>
				</div>
				<div className="rounded-2xl border border-[var(--line)] bg-[var(--chip-bg)] px-4 py-3 text-xs font-medium text-[var(--sea-ink-soft)] shadow-sm">
					<div>Total bells mapped: {bells.length}</div>
				</div>
			</section>

			<section className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
				<BellsMap bells={bells} />

				<div className="space-y-3 max-h-[480px] overflow-y-auto rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-4">
					{bells.map((bell) => (
						<article
							key={bell.id}
							className="rounded-xl border border-[color-mix(in_oklab,var(--line)_70%,var(--lagoon)_30%)] bg-[color-mix(in_oklab,var(--surface-strong)_92%,white_8%)] p-3 text-sm"
						>
							<h2 className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
								{bell.title}
							</h2>
							<p className="m-0 text-xs text-[var(--sea-ink-soft)]">
								{bell.county} County
							</p>
							{bell.artist ? (
								<p className="mt-1 mb-0 text-xs text-[var(--sea-ink-soft)]">
									Artist: {bell.artist}
								</p>
							) : null}
							<p className="mt-1 mb-0 text-xs text-[var(--sea-ink-soft)]">
								Current location: {bell.currentAddress}
							</p>
						</article>
					))}
					{bells.length === 0 ? (
						<p className="m-0 text-xs text-[var(--sea-ink-soft)]">
							No bells are loaded yet. Run <code>npm run sync:bells</code> to
							fetch and geocode data from America250PA.
						</p>
					) : null}
				</div>
			</section>
		</main>
	);
}
