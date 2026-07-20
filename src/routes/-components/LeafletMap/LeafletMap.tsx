import type {
	Map as LeafletMapInstance,
	Marker as LeafletMarker,
} from "leaflet";
import type * as Leaflet from "leaflet";
import { MapPinOff, X } from "lucide-react";
import type { RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Bell } from "../../../lib/bells/types";
import { MapLoading } from "../MapLoading/MapLoading";
import { BellVisitStatus } from "../BellVisitStatus/BellVisitStatus";
import { useVisitStatuses } from "../../../lib/visits/VisitStatusContext";
import { BellPopupContent } from "../BellPopupContent/BellPopupContent";
import { useBellMarkerHandlers } from "./hooks/useBellMarkerHandlers";
import { useBellPopupHandlers } from "./hooks/useBellPopupHandlers";
import { createBellMarkerIcon } from "./components/Marker/createBellMarkerIcon";
import { createMarkerClusterGroupOptions } from "./components/ClusterMarker/createMarkerClusterGroupOptions";
import { MapLocateControl } from "./components/MapLocateControl/MapLocateControl";
import { MapZoomControl } from "./components/MapZoomControl/MapZoomControl";
import {
	DEFAULT_MAP_CENTER,
	DEFAULT_MAP_ZOOM,
	focusMapOnMarkers,
} from "./utils/focusMapOnMarkers";
import { getMapViewportPadding } from "./utils/mapViewportPadding";
import styles from "./LeafletMap.module.css";

type ReactLeafletModule = typeof import("react-leaflet");
type MarkerClusterGroupComponent =
	typeof import("react-leaflet-cluster").default;

type Props = {
	bells: Bell[];
	sidebarOpen: boolean;
	isMobile: boolean;
	highlightRef: RefObject<((id: string | null) => void) | null>;
	selectedBellId?: string | null;
	onBellSelect?: (id: string) => void;
};

/**
 * Kick off the Leaflet downloads as soon as this module is evaluated in the
 * browser (rather than waiting for mount), so tiles can render sooner.
 * Browser-only: Leaflet touches `window` at import time.
 */
const leafletModulesPromise =
	typeof window !== "undefined"
		? Promise.all([
				import("react-leaflet"),
				import("leaflet"),
				import("react-leaflet-cluster"),
				import("leaflet/dist/leaflet.css"),
				import("react-leaflet-cluster/dist/assets/MarkerCluster.css"),
			])
		: null;

export function LeafletMap({
	bells,
	sidebarOpen,
	isMobile,
	highlightRef,
	selectedBellId,
	onBellSelect,
}: Props) {
	const [leaflet, setLeaflet] = useState<ReactLeafletModule | null>(null);
	const [markerClusterGroup, setMarkerClusterGroup] =
		useState<MarkerClusterGroupComponent | null>(null);
	const [L, setL] = useState<typeof Leaflet | null>(null);
	const [mapReady, setMapReady] = useState(false);
	const [locationWarning, setLocationWarning] = useState<string | null>(null);
	const mapRef = useRef<LeafletMapInstance>(null);
	const shellRef = useRef<HTMLDivElement>(null);

	const { getStatus } = useVisitStatuses();

	const { markerRefs, setMarkerHighlight, registerMarkerRef } =
		useBellMarkerHandlers(highlightRef);

	const {
		enableMapHoverPopup,
		handleMarkerMouseOver,
		handleMarkerMouseOut,
		handlePopupMouseOut,
	} = useBellPopupHandlers({
		mapRef,
		markerRefs,
		setMarkerHighlight,
		isMobile,
		sidebarOpen,
		selectedBellId,
		bells,
		mapReady,
	});

	useEffect(() => {
		let mounted = true;
		void (async () => {
			if (!leafletModulesPromise) return;
			const [reactLeaflet, leafletLib, clusterModule] =
				await leafletModulesPromise;
			if (!mounted) return;
			setLeaflet(reactLeaflet);
			setL(leafletLib);
			setMarkerClusterGroup(() => clusterModule.default);
		})();
		return () => {
			mounted = false;
		};
	}, []);

	useEffect(() => {
		const shell = shellRef.current;
		const map = mapRef.current;
		if (!mapReady || !shell || !map || !L) {
			return;
		}

		const syncView = () => {
			const rootFontSize =
				Number.parseFloat(
					getComputedStyle(document.documentElement).fontSize,
				) || 16;
			const padding = getMapViewportPadding({
				sidebarOpen,
				isMobile,
				viewportWidth: window.innerWidth,
				rootFontSize,
			});
			focusMapOnMarkers(map, L, bells, padding);
		};

		syncView();

		const observer = new ResizeObserver(() => {
			syncView();
		});
		observer.observe(shell);
		window.addEventListener("resize", syncView);

		return () => {
			observer.disconnect();
			window.removeEventListener("resize", syncView);
		};
	}, [L, mapReady, bells, sidebarOpen, isMobile]);

	const bellMarkerIcons = useMemo(
		() =>
			L
				? {
						none: createBellMarkerIcon(L, "none"),
						want: createBellMarkerIcon(L, "want"),
						been: createBellMarkerIcon(L, "been"),
					}
				: null,
		[L],
	);
	const markerClusterOptions = useMemo(
		() => (L ? createMarkerClusterGroupOptions(L) : null),
		[L],
	);

	if (
		!leaflet ||
		!L ||
		!bellMarkerIcons ||
		!markerClusterGroup ||
		!markerClusterOptions
	) {
		return <MapLoading />;
	}

	const { MapContainer, TileLayer, Marker, Popup } = leaflet;
	const MarkerClusterGroup = markerClusterGroup;
	const initialCenter: [number, number] =
		bells.length > 0 ? [bells[0].lat, bells[0].lng] : DEFAULT_MAP_CENTER;

	return (
		<div ref={shellRef} className={styles.mapShell}>
			<MapContainer
				ref={mapRef}
				center={initialCenter}
				zoom={DEFAULT_MAP_ZOOM}
				style={{ height: "100%", width: "100%" }}
				scrollWheelZoom
				zoomControl={false}
				whenReady={() => {
					setMapReady(true);
				}}
			>
				<MapLocateControl
					sidebarOpen={sidebarOpen}
					isMobile={isMobile}
					onError={setLocationWarning}
				/>
				<MapZoomControl sidebarOpen={sidebarOpen} isMobile={isMobile} />
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<MarkerClusterGroup {...markerClusterOptions}>
					{bells.map((bell) => (
						<Marker
							key={bell.id}
							position={[bell.lat, bell.lng]}
							icon={bellMarkerIcons[getStatus(bell.id)]}
							eventHandlers={{
								click: () => onBellSelect?.(bell.id),
								mouseover: () => handleMarkerMouseOver(bell.id),
								mouseout: (event) => handleMarkerMouseOut(bell.id, event),
							}}
							ref={(instance) => {
								registerMarkerRef(bell.id, instance as LeafletMarker | null);
							}}
						>
							{enableMapHoverPopup ? (
								<Popup
									className={styles.bellPopup}
									eventHandlers={{
										mouseout: (event) => handlePopupMouseOut(bell.id, event),
									}}
								>
									<BellPopupContent
										bell={bell}
										actions={<BellVisitStatus bellId={bell.id} />}
									/>
								</Popup>
							) : null}
						</Marker>
					))}
				</MarkerClusterGroup>
			</MapContainer>
			{locationWarning ? (
				<aside className={styles.locationWarning} role="alert">
					<MapPinOff
						className={styles.locationWarningIcon}
						size={18}
						aria-hidden="true"
					/>
					<p className={styles.locationWarningMessage}>{locationWarning}</p>
					<button
						type="button"
						className={styles.locationWarningDismiss}
						onClick={() => setLocationWarning(null)}
						aria-label="Dismiss location warning"
					>
						<X size={16} aria-hidden="true" />
					</button>
				</aside>
			) : null}
		</div>
	);
}
