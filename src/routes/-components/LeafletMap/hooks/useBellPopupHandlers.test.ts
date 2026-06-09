import { act, renderHook } from "@testing-library/react";
import type {
	LeafletMouseEvent,
	Map as LeafletMapInstance,
	Marker as LeafletMarker,
} from "leaflet";
import type { RefObject } from "react";
import { describe, expect, it, vi } from "vitest";
import type { Bell } from "../../../../lib/bells/types";
import { CLUSTER_DISABLE_ZOOM } from "../components/ClusterMarker/createMarkerClusterGroupOptions";
import { useBellPopupHandlers } from "./useBellPopupHandlers";

function makeBell(overrides: Partial<Bell> & Pick<Bell, "id">): Bell {
	return {
		title: "Test Bell",
		county: "York",
		address: { street: "123 Main St", city: "York", zip: "17401" },
		sourceSlug: "test",
		lat: 40.1,
		lng: -77.2,
		...overrides,
	};
}

function makeMouseOutEvent(
	relatedTarget: EventTarget | null,
): LeafletMouseEvent {
	return {
		originalEvent: { relatedTarget } as MouseEvent,
	} as LeafletMouseEvent;
}

function makeMockMarker() {
	const markerEl = document.createElement("div");
	const popupEl = document.createElement("div");
	const openPopup = vi.fn();
	const getPopup = vi.fn(() => ({
		getElement: () => popupEl,
	}));

	const marker = {
		getElement: () => markerEl,
		getPopup,
		openPopup,
	} as unknown as LeafletMarker;

	return { marker, markerEl, popupEl, openPopup, getPopup };
}

type HookParams = {
	mapRef: RefObject<LeafletMapInstance | null>;
	markerRefs: RefObject<Map<string, LeafletMarker>>;
	setMarkerHighlight: (id: string | null) => void;
	isMobile: boolean;
	sidebarOpen: boolean;
	selectedBellId?: string | null;
	bells: Bell[];
	mapReady: boolean;
};

function renderPopupHandlers(overrides: Partial<HookParams> = {}) {
	const closePopup = vi.fn();
	const flyTo = vi.fn();
	const once = vi.fn();
	const off = vi.fn();
	const mapRef = {
		current: { closePopup, flyTo, once, off } as unknown as LeafletMapInstance,
	};
	const markerRefs = { current: new Map<string, LeafletMarker>() };
	const setMarkerHighlight = vi.fn<(id: string | null) => void>();
	const bells = overrides.bells ?? [makeBell({ id: "a" })];

	const params: HookParams = {
		mapRef,
		markerRefs,
		setMarkerHighlight,
		isMobile: false,
		sidebarOpen: false,
		selectedBellId: null,
		bells,
		mapReady: true,
		...overrides,
	};

	const hook = renderHook((props: HookParams) => useBellPopupHandlers(props), {
		initialProps: params,
	});

	return {
		...hook,
		mapRef,
		markerRefs,
		setMarkerHighlight,
		closePopup,
		flyTo,
		once,
		off,
		params,
	};
}

describe("useBellPopupHandlers", () => {
	it("enables hover popups on desktop only", () => {
		const desktop = renderPopupHandlers();
		expect(desktop.result.current.enableMapHoverPopup).toBe(true);

		const mobile = renderPopupHandlers({ isMobile: true });
		expect(mobile.result.current.enableMapHoverPopup).toBe(false);
	});

	it("highlights and opens popup on marker mouseover when enabled", () => {
		const { result, markerRefs, setMarkerHighlight } = renderPopupHandlers();
		const { marker, openPopup } = makeMockMarker();
		markerRefs.current.set("a", marker);

		act(() => {
			result.current.handleMarkerMouseOver("a");
		});

		expect(setMarkerHighlight).toHaveBeenCalledWith("a");
		expect(openPopup).toHaveBeenCalledTimes(1);
	});

	it("does nothing on marker mouseover when hover popups are disabled", () => {
		const { result, markerRefs, setMarkerHighlight } = renderPopupHandlers({
			isMobile: true,
		});
		const { marker, openPopup } = makeMockMarker();
		markerRefs.current.set("a", marker);

		act(() => {
			result.current.handleMarkerMouseOver("a");
		});

		expect(setMarkerHighlight).not.toHaveBeenCalled();
		expect(openPopup).not.toHaveBeenCalled();
	});

	it("closes popup and clears highlight on marker mouseout", () => {
		const { result, markerRefs, setMarkerHighlight, closePopup } =
			renderPopupHandlers();
		const { marker, popupEl } = makeMockMarker();
		markerRefs.current.set("a", marker);

		act(() => {
			result.current.handleMarkerMouseOut(
				"a",
				makeMouseOutEvent(document.body),
			);
		});

		expect(closePopup).toHaveBeenCalledTimes(1);
		expect(setMarkerHighlight).toHaveBeenCalledWith(null);
		expect(popupEl.contains(document.body)).toBe(false);
	});

	it("keeps popup open when pointer moves from marker into popup", () => {
		const { result, markerRefs, setMarkerHighlight, closePopup } =
			renderPopupHandlers();
		const { marker, popupEl } = makeMockMarker();
		const child = document.createElement("span");
		popupEl.appendChild(child);
		markerRefs.current.set("a", marker);

		act(() => {
			result.current.handleMarkerMouseOut("a", makeMouseOutEvent(child));
		});

		expect(closePopup).not.toHaveBeenCalled();
		expect(setMarkerHighlight).not.toHaveBeenCalled();
	});

	it("closes popup and clears highlight on popup mouseout", () => {
		const { result, markerRefs, setMarkerHighlight, closePopup } =
			renderPopupHandlers();
		const { marker, markerEl } = makeMockMarker();
		markerRefs.current.set("a", marker);

		act(() => {
			result.current.handlePopupMouseOut("a", makeMouseOutEvent(document.body));
		});

		expect(closePopup).toHaveBeenCalledTimes(1);
		expect(setMarkerHighlight).toHaveBeenCalledWith(null);
		expect(markerEl.contains(document.body)).toBe(false);
	});

	it("keeps popup open when pointer moves from popup back to marker", () => {
		const { result, markerRefs, setMarkerHighlight, closePopup } =
			renderPopupHandlers();
		const { marker, markerEl } = makeMockMarker();
		markerRefs.current.set("a", marker);

		act(() => {
			result.current.handlePopupMouseOut("a", makeMouseOutEvent(markerEl));
		});

		expect(closePopup).not.toHaveBeenCalled();
		expect(setMarkerHighlight).not.toHaveBeenCalled();
	});

	it("flies to selected bell and opens popup after move when sidebar is closed", () => {
		const bell = makeBell({ id: "a", lat: 40.5, lng: -77.5 });
		const { once, flyTo, markerRefs, rerender, params } = renderPopupHandlers({
			bells: [bell],
			selectedBellId: null,
			mapReady: false,
		});
		const { marker, openPopup } = makeMockMarker();
		markerRefs.current.set("a", marker);

		rerender({ ...params, selectedBellId: "a", mapReady: true });

		expect(flyTo).toHaveBeenCalledWith([40.5, -77.5], CLUSTER_DISABLE_ZOOM);
		expect(once).toHaveBeenCalledWith("moveend", expect.any(Function));

		const onMoveEnd = once.mock.calls[0]?.[1] as () => void;
		act(() => {
			onMoveEnd();
		});

		expect(openPopup).toHaveBeenCalledTimes(1);
	});

	it("flies to selected bell but skips popup when sidebar is open", () => {
		const bell = makeBell({ id: "a" });
		const { once, flyTo, markerRefs, rerender, params } = renderPopupHandlers({
			bells: [bell],
			sidebarOpen: true,
			selectedBellId: null,
			mapReady: false,
		});
		const { marker, openPopup } = makeMockMarker();
		markerRefs.current.set("a", marker);

		rerender({
			...params,
			sidebarOpen: true,
			selectedBellId: "a",
			mapReady: true,
		});

		expect(flyTo).toHaveBeenCalledWith(
			[bell.lat, bell.lng],
			CLUSTER_DISABLE_ZOOM,
		);

		const onMoveEnd = once.mock.calls[0]?.[1] as () => void;
		act(() => {
			onMoveEnd();
		});

		expect(openPopup).not.toHaveBeenCalled();
	});

	it("cleans up moveend listener when selection changes", () => {
		const bell = makeBell({ id: "a" });
		const { once, off, rerender, params } = renderPopupHandlers({
			bells: [bell],
			selectedBellId: "a",
		});

		const onMoveEnd = once.mock.calls[0]?.[1] as () => void;

		rerender({ ...params, selectedBellId: null });

		expect(off).toHaveBeenCalledWith("moveend", onMoveEnd);
	});
});
