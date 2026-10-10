import type { Map as MapInstance, Marker, Popup } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { Feature, Point } from "geojson";
import type { RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Supercluster from "supercluster";
import type { Bell } from "../../../../lib/bells/types";
import {
	getGeolocationErrorMessage,
	GEOLOCATION_MESSAGES,
} from "../../../../lib/geolocation/geolocation";
import { useVisitStatuses } from "../../../../lib/visits/VisitStatusContext";
import {
	buildClusterIconHtml,
	getClusterSizeClass,
	getClusterTier,
} from "../components/ClusterMarker/createClusterIcon";
import {
	BELL_MARKER_HEIGHT,
	createBellMarkerElement,
} from "../components/Marker/createBellMarkerIcon";
import { getMapCenterOffset } from "../utils/mapViewportPadding";
import {
	fitBells,
	fitPennsylvania,
	setPennsylvaniaZoomLimit,
	viewportPadding,
} from "../utils/mapCamera";
import { isMovingToElement } from "../utils/isMovingToElement";
import styles from "../MapLibreMap.module.css";

type MapLibreModule = typeof import("maplibre-gl");
export type UseMapLibreMapOptions = {
	bells: Bell[];
	sidebarOpen: boolean;
	isMobile: boolean;
	highlightRef: RefObject<((id: string | null) => void) | null>;
	selectedBellId?: string | null;
	onBellSelect?: (id: string) => void;
};
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const DEFAULT_CENTER: [number, number] = [-77.79, 40.87];
const SELECT_ZOOM = 14;
const maplibrePromise =
	typeof window === "undefined"
		? null
		: Promise.all([
				import("maplibre-gl"),
				import("maplibre-gl/dist/maplibre-gl.css"),
			]).then(([module]) => module);

export function useMapLibreMap({
	bells,
	sidebarOpen,
	isMobile,
	highlightRef,
	selectedBellId,
	onBellSelect,
}: UseMapLibreMapOptions) {
	const shellRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<MapInstance | null>(null);
	const markersRef = useRef<Map<string, Marker>>(new Map());
	const popupRef = useRef<Popup | null>(null);
	const initialFitRef = useRef(false);
	const sidebarOpenRef = useRef(sidebarOpen);
	const previousSidebarOpenRef = useRef(sidebarOpen);
	sidebarOpenRef.current = sidebarOpen;
	const locationMarkerRef = useRef<Marker | null>(null);
	const [libre, setLibre] = useState<MapLibreModule | null>(null);
	const [mapReady, setMapReady] = useState(false);
	const [viewportVersion, setViewportVersion] = useState(0);
	const [popupBellId, setPopupBellId] = useState<string | null>(null);
	const [popupNode] = useState(() =>
		typeof document === "undefined" ? null : document.createElement("div"),
	);
	const [locationWarning, setLocationWarning] = useState<string | null>(null);
	const [locating, setLocating] = useState(false);
	const { getStatus } = useVisitStatuses();

	const clusterIndex = useMemo(() => {
		const index = new Supercluster<{ bellId: string }, { count: number }>({
			radius: 56,
			maxZoom: SELECT_ZOOM - 1,
		});
		index.load(
			bells.map(
				(bell): Feature<Point, { bellId: string }> => ({
					type: "Feature",
					properties: { bellId: bell.id },
					geometry: { type: "Point", coordinates: [bell.lng, bell.lat] },
				}),
			),
		);
		return index;
	}, [bells]);

	const closePopup = useCallback(() => {
		popupRef.current?.remove();
		setPopupBellId(null);
	}, []);
	const openPopup = useCallback(
		(bell: Bell) => {
			const map = mapRef.current;
			if (!map || !popupRef.current || !popupNode || isMobile) return;
			popupRef.current
				.setLngLat([bell.lng, bell.lat])
				.setDOMContent(popupNode)
				.addTo(map);
			setPopupBellId(bell.id);
		},
		[isMobile, popupNode],
	);

	useEffect(() => {
		let active = true;
		void maplibrePromise?.then((module) => {
			if (active) setLibre(module);
		});
		return () => {
			active = false;
		};
	}, []);

	useEffect(() => {
		if (!libre || !canvasRef.current) return;
		libre.setWorkerUrl(workerUrl);
		const map = new libre.Map({
			container: canvasRef.current,
			style: MAP_STYLE,
			center: DEFAULT_CENTER,
			zoom: 7,
			attributionControl: false,
		});
		const popup = new libre.Popup({
			className: styles.bellPopup,
			maxWidth: "none",
			offset: BELL_MARKER_HEIGHT + 20,
			closeOnClick: false,
		});
		popup.on("close", () => setPopupBellId(null));
		map.addControl(
			new libre.AttributionControl({ compact: true }),
			"bottom-left",
		);
		mapRef.current = map;
		popupRef.current = popup;
		map.on("load", () => setMapReady(true));
		const syncMapState = () => {
			const center = map.getCenter();
			map.getContainer().dataset.mapCenter = `${center.lng},${center.lat}`;
			map.getContainer().dataset.mapZoom = `${map.getZoom()}`;
			map.getContainer().dataset.mapMinZoom = `${map.getMinZoom()}`;
			setViewportVersion((version) => version + 1);
		};
		map.on("moveend", syncMapState);
		map.on("load", syncMapState);
		return () => {
			markersRef.current.forEach((marker) => {
				marker.remove();
			});
			markersRef.current.clear();
			locationMarkerRef.current?.remove();
			popup.remove();
			map.remove();
			mapRef.current = null;
			popupRef.current = null;
		};
	}, [libre]);

	useEffect(() => {
		const map = mapRef.current;
		if (mapReady && map) {
			map.resize();
			setPennsylvaniaZoomLimit(map, isMobile);
			if (!initialFitRef.current) {
				fitPennsylvania(map, isMobile);
				initialFitRef.current = true;
			} else {
				fitBells(map, bells, viewportPadding(isMobile));
			}
		}
	}, [mapReady, bells, isMobile]);

	useEffect(() => {
		const map = mapRef.current;
		const shell = shellRef.current;
		if (!mapReady || !map || !shell) return;
		const observer = new ResizeObserver(() => {
			map.resize();
			setPennsylvaniaZoomLimit(map, isMobile);
		});
		observer.observe(shell);
		return () => {
			observer.disconnect();
		};
	}, [mapReady, isMobile]);

	useEffect(() => {
		const map = mapRef.current;
		if (!mapReady || !map || !libre) return;
		void viewportVersion;
		const bounds = map.getBounds();
		const clusters = clusterIndex.getClusters(
			[
				bounds.getWest(),
				bounds.getSouth(),
				bounds.getEast(),
				bounds.getNorth(),
			],
			Math.min(Math.floor(map.getZoom()), SELECT_ZOOM),
		);
		const next = new Map<string, Marker>();
		for (const feature of clusters) {
			const [lng, lat] = feature.geometry.coordinates;
			if ("cluster_id" in feature.properties) {
				const count = feature.properties.point_count;
				const clusterId = feature.properties.cluster_id;
				const element = document.createElement("button");
				element.type = "button";
				element.className = `${styles.clusterButton} ${getClusterSizeClass(getClusterTier(count))}`;
				element.innerHTML = buildClusterIconHtml(count);
				element.setAttribute("aria-label", `Zoom to ${count} bells`);
				element.addEventListener("click", () => {
					const zoom = clusterIndex.getClusterExpansionZoom(clusterId);
					map.easeTo({ center: [lng, lat], zoom: Math.min(zoom, SELECT_ZOOM) });
				});
				const marker = new libre.Marker({ element, anchor: "center" })
					.setLngLat([lng, lat])
					.addTo(map);
				next.set(`cluster-${clusterId}`, marker);
			} else {
				const bellId =
					"bellId" in feature.properties ? feature.properties.bellId : null;
				const bell = bells.find((item) => item.id === bellId);
				if (!bell) continue;
				const element = createBellMarkerElement(getStatus(bell.id));
				element.setAttribute("aria-label", bell.title);
				element.addEventListener("click", () => onBellSelect?.(bell.id));
				element.addEventListener("mouseenter", () => {
					element.classList.add(styles.highlighted);
					openPopup(bell);
				});
				element.addEventListener("mouseleave", (event) => {
					if (
						!isMovingToElement(
							event.relatedTarget,
							popupRef.current?.getElement(),
						)
					) {
						element.classList.remove(styles.highlighted);
						closePopup();
					}
				});
				const marker = new libre.Marker({ element, anchor: "bottom" })
					.setLngLat([bell.lng, bell.lat])
					.addTo(map);
				next.set(bell.id, marker);
			}
		}
		markersRef.current.forEach((marker) => {
			marker.remove();
		});
		markersRef.current = next;
		return () => {
			next.forEach((marker) => {
				marker.remove();
			});
		};
	}, [
		mapReady,
		viewportVersion,
		clusterIndex,
		bells,
		libre,
		getStatus,
		onBellSelect,
		openPopup,
		closePopup,
	]);

	useEffect(() => {
		highlightRef.current = (id) => {
			markersRef.current.forEach((marker) => {
				marker.getElement().classList.remove(styles.highlighted);
			});
			if (id)
				markersRef.current
					.get(id)
					?.getElement()
					.classList.add(styles.highlighted);
		};
		return () => {
			highlightRef.current = null;
		};
	}, [highlightRef]);

	useEffect(() => {
		const map = mapRef.current;
		if (!mapReady || !map || !selectedBellId) return;
		const bell = bells.find((item) => item.id === selectedBellId);
		if (!bell) return;
		map.flyTo({
			center: [bell.lng, bell.lat],
			zoom: SELECT_ZOOM,
			offset: getMapCenterOffset(viewportPadding(isMobile)),
		});
		const onMoveEnd = () => {
			if (!sidebarOpenRef.current && !isMobile) openPopup(bell);
		};
		map.once("moveend", onMoveEnd);
		return () => {
			map.off("moveend", onMoveEnd);
		};
	}, [selectedBellId, bells, mapReady, isMobile, openPopup]);

	useEffect(() => {
		const changed = previousSidebarOpenRef.current !== sidebarOpen;
		previousSidebarOpenRef.current = sidebarOpen;
		if (!changed || !mapReady || isMobile) return;
		if (sidebarOpen) {
			closePopup();
		} else if (selectedBellId) {
			const bell = bells.find((item) => item.id === selectedBellId);
			if (bell) openPopup(bell);
		}
	}, [
		sidebarOpen,
		selectedBellId,
		bells,
		mapReady,
		isMobile,
		openPopup,
		closePopup,
	]);

	const zoom = (delta: number) => {
		const map = mapRef.current;
		if (map)
			map.easeTo({
				zoom: Math.max(map.getMinZoom(), map.getZoom() + delta),
				offset: getMapCenterOffset(viewportPadding(isMobile)),
			});
	};
	const locate = () => {
		if (!navigator.geolocation) {
			setLocationWarning(GEOLOCATION_MESSAGES.unsupported);
			return;
		}
		setLocationWarning(null);
		setLocating(true);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				setLocating(false);
				const { latitude, longitude } = position.coords;
				mapRef.current?.flyTo({
					center: [longitude, latitude],
					zoom: SELECT_ZOOM,
					offset: getMapCenterOffset(viewportPadding(isMobile)),
				});
				if (!libre || !mapRef.current) return;
				if (!locationMarkerRef.current) {
					const element = document.createElement("div");
					element.className = styles.locationMarker;
					element.innerHTML = `<span class="${styles.locationPulse}"></span><span class="${styles.locationDot}" data-location-marker></span>`;
					locationMarkerRef.current = new libre.Marker({
						element,
						anchor: "center",
					})
						.setLngLat([longitude, latitude])
						.addTo(mapRef.current);
				} else locationMarkerRef.current.setLngLat([longitude, latitude]);
			},
			(error) => {
				setLocating(false);
				setLocationWarning(getGeolocationErrorMessage(error));
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
		);
	};

	const popupBell = bells.find((bell) => bell.id === popupBellId);
	const map = mapRef.current;
	const atZoomOutLimit =
		map !== null && map.getZoom() <= map.getMinZoom() + 0.01;
	const handlePopupMouseLeave = (relatedTarget: EventTarget | null) => {
		if (
			!popupBell ||
			!isMovingToElement(
				relatedTarget,
				markersRef.current.get(popupBell.id)?.getElement(),
			)
		)
			closePopup();
	};

	return {
		shellRef,
		canvasRef,
		mapReady,
		popupNode,
		popupBell,
		locationWarning,
		locating,
		atZoomOutLimit,
		zoom,
		locate,
		handlePopupMouseLeave,
		dismissLocationWarning: () => setLocationWarning(null),
	};
}
