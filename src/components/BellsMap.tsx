import { ClientOnly } from "@tanstack/react-router";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useState } from "react";
import type { Bell } from "../lib/bells/types";

function configureLeafletDefaultIcons(L: LModule) {
	// Leaflet prepends its dist path to icon URLs unless _getIconUrl is removed.
	delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
	L.Icon.Default.mergeOptions({
		iconRetinaUrl: markerIcon2x,
		iconUrl: markerIcon,
		shadowUrl: markerShadow,
	});
}

type LeafletModule = typeof import("react-leaflet");
type LModule = typeof import("leaflet");

type Props = {
	bells: Bell[];
};

export function BellsMap({ bells }: Props) {
	return (
		<ClientOnly
			fallback={
				<div className="island-shell rise-in flex min-h-[480px] w-full items-center justify-center rounded-[1.5rem] text-sm text-[var(--sea-ink-soft)]">
					Loading map…
				</div>
			}
		>
			<LeafletMap bells={bells} />
		</ClientOnly>
	);
}

function LeafletMap({ bells }: Props) {
	const [leaflet, setLeaflet] = useState<LeafletModule | null>(null);
	const [L, setL] = useState<LModule | null>(null);

	useEffect(() => {
		let mounted = true;
		void (async () => {
			const [reactLeaflet, leafletLib] = await Promise.all([
				import("react-leaflet"),
				import("leaflet"),
				import("leaflet/dist/leaflet.css"),
			]);
			if (!mounted) return;
			configureLeafletDefaultIcons(leafletLib);
			setLeaflet(reactLeaflet);
			setL(leafletLib);
		})();
		return () => {
			mounted = false;
		};
	}, []);

	if (!leaflet || !L) {
		return (
			<div className="island-shell rise-in flex min-h-[480px] w-full items-center justify-center rounded-[1.5rem] text-sm text-[var(--sea-ink-soft)]">
				Loading map…
			</div>
		);
	}

	const { MapContainer, TileLayer, Marker, Popup } = leaflet;

	const center: [number, number] = [40.9, -77.8];

	return (
		<div
			className="island-shell rise-in w-full overflow-hidden rounded-[1.5rem]"
			style={{ minHeight: 480, height: 480 }}
		>
			<MapContainer
				center={center}
				zoom={7}
				style={{ height: "100%", width: "100%", minHeight: 480 }}
				scrollWheelZoom
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				{bells.map((bell) => (
					<Marker key={bell.id} position={[bell.lat, bell.lng]}>
						<Popup>
							<BellPopupContent bell={bell} />
						</Popup>
					</Marker>
				))}
			</MapContainer>
		</div>
	);
}

function BellPopupContent({ bell }: { bell: Bell }) {
	return (
		<div className="space-y-1 text-sm">
			<h3 className="m-0 text-base font-semibold">
				{bell.title}{" "}
				<span className="text-xs text-[var(--sea-ink-soft)]">
					({bell.county} County)
				</span>
			</h3>
			{bell.artist ? (
				<p className="m-0 text-[var(--sea-ink-soft)]">Artist: {bell.artist}</p>
			) : null}
			<p className="m-0 text-[var(--sea-ink-soft)]">
				Current location: {bell.currentAddress}
			</p>
			{bell.localityLabel ? (
				<p className="m-0 text-xs text-[var(--sea-ink-soft)]">
					Locality: {bell.localityLabel}
				</p>
			) : null}
			{bell.geocodeQuality === "approximate" ? (
				<p className="m-0 text-xs text-amber-700">
					Approximate map location ({bell.geocodeSource})
				</p>
			) : null}
			{bell.imageUrl ? (
				<img
					src={bell.imageUrl}
					alt={bell.title}
					className="mt-1 max-h-32 w-full rounded-lg object-cover"
				/>
			) : null}
		</div>
	);
}
