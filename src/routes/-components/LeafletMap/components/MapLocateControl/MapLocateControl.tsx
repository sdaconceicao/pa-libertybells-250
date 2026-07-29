import type { Control, Marker } from "leaflet";
import {
	DomEvent,
	divIcon,
	DomUtil,
	Control as LeafletControl,
	marker,
} from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import {
	getGeolocationErrorMessage,
	GEOLOCATION_MESSAGES,
} from "../../../../../lib/geolocation/geolocation";
import {
	getMapCenterForVisibleLatLng,
	getMapViewportPadding,
} from "../../utils/mapViewportPadding";
import styles from "./MapLocateControl.module.css";

/** Zoom level applied when we snap the map to the visitor's location. */
const LOCATE_ZOOM = 14;

function createLocationIcon() {
	return divIcon({
		className: styles.locationMarker,
		html: `<span class="${styles.locationPulse}"></span><span class="${styles.locationDot}" data-location-marker></span>`,
		iconSize: [18, 18],
		iconAnchor: [9, 9],
	});
}

/** lucide `locate-fixed` — the idle crosshair glyph. */
const LOCATE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/></svg>`;

/** lucide `loader-circle` — shown (spinning) while a fix is pending. */
const BUSY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;

type Props = {
	sidebarOpen: boolean;
	isMobile: boolean;
	/** Called with a message on failure, or `null` once a fix succeeds/starts. */
	onError: (message: string | null) => void;
};

function getViewportPadding(sidebarOpen: boolean, isMobile: boolean) {
	const rootFontSize =
		Number.parseFloat(getComputedStyle(document.documentElement).fontSize) ||
		16;

	return getMapViewportPadding({
		sidebarOpen,
		isMobile,
		viewportWidth: window.innerWidth,
		rootFontSize,
	});
}

export function MapLocateControl({ sidebarOpen, isMobile, onError }: Props) {
	const map = useMap();

	// Read the latest props at click-time without rebuilding the control.
	const sidebarOpenRef = useRef(sidebarOpen);
	const isMobileRef = useRef(isMobile);
	const onErrorRef = useRef(onError);
	sidebarOpenRef.current = sidebarOpen;
	isMobileRef.current = isMobile;
	onErrorRef.current = onError;

	// The "you are here" marker persists across control rebuilds.
	const locationMarkerRef = useRef<Marker | null>(null);

	useEffect(() => {
		const LocateControl = LeafletControl.extend({
			options: {
				position: "bottomright",
			},
			onAdd() {
				const container = DomUtil.create(
					"div",
					`leaflet-bar ${styles.locateBar}`,
				);
				const button = DomUtil.create(
					"a",
					styles.locateButton,
					container,
				) as HTMLAnchorElement;
				button.href = "#";
				button.title = "Center on my location";
				button.setAttribute("role", "button");
				button.setAttribute("aria-label", "Center on my location");
				button.innerHTML = LOCATE_ICON;

				const setBusy = (busy: boolean) => {
					if (busy) {
						button.setAttribute("aria-busy", "true");
						button.innerHTML = BUSY_ICON;
					} else {
						button.removeAttribute("aria-busy");
						button.innerHTML = LOCATE_ICON;
					}
				};

				const focusOnLocation = (latitude: number, longitude: number) => {
					const padding = getViewportPadding(
						sidebarOpenRef.current,
						isMobileRef.current,
					);
					const center = getMapCenterForVisibleLatLng(
						map,
						[latitude, longitude],
						LOCATE_ZOOM,
						padding,
					);
					map.setView(center, LOCATE_ZOOM, { animate: true });

					if (locationMarkerRef.current) {
						locationMarkerRef.current.setLatLng([latitude, longitude]);
					} else {
						locationMarkerRef.current = marker([latitude, longitude], {
							icon: createLocationIcon(),
							interactive: false,
							keyboard: false,
							zIndexOffset: 1000,
						}).addTo(map);
					}
				};

				const handleLocate = () => {
					if (typeof navigator === "undefined" || !navigator.geolocation) {
						onErrorRef.current(GEOLOCATION_MESSAGES.unsupported);
						return;
					}

					onErrorRef.current(null);
					setBusy(true);

					navigator.geolocation.getCurrentPosition(
						(position) => {
							setBusy(false);
							const { latitude, longitude } = position.coords;
							focusOnLocation(latitude, longitude);
						},
						(error) => {
							setBusy(false);
							onErrorRef.current(getGeolocationErrorMessage(error));
						},
						{
							enableHighAccuracy: true,
							timeout: 10000,
							maximumAge: 60000,
						},
					);
				};

				DomEvent.on(button, "click", DomEvent.stop)
					.on(button, "click", handleLocate)
					.on(button, "dblclick", DomEvent.stop);

				return container;
			},
		});

		const control = new LocateControl() as Control;
		control.addTo(map);

		return () => {
			control.remove();
		};
	}, [map]);

	// Remove the location marker when the map unmounts.
	useEffect(() => {
		return () => {
			locationMarkerRef.current?.remove();
			locationMarkerRef.current = null;
		};
	}, []);

	return null;
}
