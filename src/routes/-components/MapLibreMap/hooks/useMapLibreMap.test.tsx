import { act, cleanup, render, waitFor } from "@testing-library/react";
import type { RefObject } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Bell } from "../../../../lib/bells/types";
import { useMapLibreMap, type UseMapLibreMapOptions } from "./useMapLibreMap";

const fake = vi.hoisted(() => {
	type Camera = {
		center?: [number, number];
		zoom?: number;
		offset?: [number, number];
	};
	class FakeMap {
		static instances: FakeMap[] = [];
		container: HTMLElement;
		options: Record<string, unknown>;
		center: [number, number] = [-77.79, 40.87];
		zoom = 7;
		minZoom = 0;
		listeners = new globalThis.Map<string, Set<() => void>>();
		resize = vi.fn();
		remove = vi.fn();
		addControl = vi.fn();
		cameraForBounds = vi.fn(() => ({ zoom: 6 }));
		fitBounds = vi.fn((_bounds: unknown, _options: unknown) => {
			this.zoom = this.minZoom;
			this.emit("moveend");
			return this;
		});
		easeTo = vi.fn((camera: Camera) => {
			this.move(camera);
			return this;
		});
		flyTo = vi.fn((camera: Camera) => {
			this.move(camera);
			return this;
		});
		setMinZoom = vi.fn((zoom: number) => {
			this.minZoom = zoom;
			if (this.zoom < zoom) this.move({ zoom });
			return this;
		});
		constructor(options: { container: HTMLElement } & Record<string, unknown>) {
			this.options = options;
			this.container = options.container;
			FakeMap.instances.push(this);
			queueMicrotask(() => this.emit("load"));
		}
		move(camera: Camera) {
			if (camera.center) this.center = camera.center;
			if (camera.zoom !== undefined)
				this.zoom = Math.max(this.minZoom, camera.zoom);
			this.emit("moveend");
		}
		on(event: string, callback: () => void) {
			const callbacks = this.listeners.get(event) ?? new Set();
			callbacks.add(callback);
			this.listeners.set(event, callbacks);
			return this;
		}
		off(event: string, callback: () => void) {
			this.listeners.get(event)?.delete(callback);
			return this;
		}
		once(event: string, callback: () => void) {
			const wrapped = () => {
				this.off(event, wrapped);
				callback();
			};
			return this.on(event, wrapped);
		}
		emit(event: string) {
			for (const callback of [...(this.listeners.get(event) ?? [])]) callback();
		}
		getCenter() {
			return { lng: this.center[0], lat: this.center[1] };
		}
		getZoom() {
			return this.zoom;
		}
		getMinZoom() {
			return this.minZoom;
		}
		getContainer() {
			return this.container;
		}
		getBounds() {
			return {
				getWest: () => -81,
				getSouth: () => 39,
				getEast: () => -74,
				getNorth: () => 43,
			};
		}
	}
	class FakeMarker {
		static instances: FakeMarker[] = [];
		element: HTMLElement;
		options: { element: HTMLElement; anchor: string };
		lngLat: [number, number] | null = null;
		removed = false;
		constructor(options: { element: HTMLElement; anchor: string }) {
			this.options = options;
			this.element = options.element;
			FakeMarker.instances.push(this);
		}
		setLngLat(lngLat: [number, number]) {
			this.lngLat = lngLat;
			return this;
		}
		addTo(_map: FakeMap) {
			return this;
		}
		getElement() {
			return this.element;
		}
		remove() {
			this.removed = true;
			return this;
		}
	}
	class FakePopup {
		static instances: FakePopup[] = [];
		options: Record<string, unknown>;
		lngLat: [number, number] | null = null;
		node: HTMLElement | null = null;
		open = false;
		onClose: (() => void) | null = null;
		element = document.createElement("div");
		constructor(options: Record<string, unknown>) {
			this.options = options;
			FakePopup.instances.push(this);
		}
		on(event: string, callback: () => void) {
			if (event === "close") this.onClose = callback;
			return this;
		}
		setLngLat(lngLat: [number, number]) {
			this.lngLat = lngLat;
			return this;
		}
		setDOMContent(node: HTMLElement) {
			this.node = node;
			return this;
		}
		addTo(_map: FakeMap) {
			this.open = true;
			return this;
		}
		getElement() {
			return this.element;
		}
		remove() {
			this.open = false;
			this.onClose?.();
			return this;
		}
	}
	return {
		Map: FakeMap,
		Marker: FakeMarker,
		Popup: FakePopup,
		AttributionControl: class {},
		setWorkerUrl: vi.fn(),
	};
});

vi.mock("maplibre-gl", () => fake);

class FakeResizeObserver {
	static instances: FakeResizeObserver[] = [];
	callback: ResizeObserverCallback;
	observe = vi.fn();
	disconnect = vi.fn();
	constructor(callback: ResizeObserverCallback) {
		this.callback = callback;
		FakeResizeObserver.instances.push(this);
	}
	trigger() {
		this.callback([], this as unknown as ResizeObserver);
	}
}

function bell(id: string, lat: number, lng: number): Bell {
	return {
		id,
		title: id,
		county: "Test",
		lat,
		lng,
		sourceSlug: "test",
		address: { street: "Main St", city: "Test", zip: "12345" },
	};
}

const west = bell("west", 40, -80);
const east = bell("east", 42, -75);
let current: ReturnType<typeof useMapLibreMap>;

function Harness(props: UseMapLibreMapOptions) {
	current = useMapLibreMap(props);
	return (
		<div ref={current.shellRef}>
			<div ref={current.canvasRef} />
		</div>
	);
}

function renderMap(overrides: Partial<UseMapLibreMapOptions> = {}) {
	const highlightRef: RefObject<((id: string | null) => void) | null> = {
		current: null,
	};
	const props: UseMapLibreMapOptions = {
		bells: [west, east],
		sidebarOpen: false,
		isMobile: false,
		highlightRef,
		...overrides,
	};
	const view = render(<Harness {...props} />);
	return { ...view, props, highlightRef };
}

async function readyMap() {
	await waitFor(() => expect(current.mapReady).toBe(true));
	return last(fake.Map.instances);
}

function last<T>(items: T[]): T {
	const item = items.at(-1);
	if (!item) throw new Error("Expected an item");
	return item;
}

function bellMarker(id: string) {
	const marker = fake.Marker.instances.find(
		(marker) =>
			marker.element.getAttribute("aria-label") === id && !marker.removed,
	);
	if (!marker) throw new Error(`Missing marker for ${id}`);
	return marker;
}

describe("useMapLibreMap", () => {
	beforeEach(() => {
		fake.Map.instances.length = 0;
		fake.Marker.instances.length = 0;
		fake.Popup.instances.length = 0;
		fake.setWorkerUrl.mockClear();
		FakeResizeObserver.instances.length = 0;
		vi.stubGlobal("ResizeObserver", FakeResizeObserver);
	});

	afterEach(() => {
		cleanup();
		vi.unstubAllGlobals();
	});

	it("creates and cleans up the map, popup, markers, and resize observer", async () => {
		const view = renderMap();
		const map = await readyMap();
		const popup = last(fake.Popup.instances);
		expect(fake.setWorkerUrl).toHaveBeenCalledOnce();
		expect(map.options.style).toBe(
			"https://tiles.openfreemap.org/styles/liberty",
		);
		expect(map.addControl).toHaveBeenCalledWith(
			expect.any(fake.AttributionControl),
			"bottom-left",
		);
		expect(popup.options.offset).toBe(60);
		expect(map.fitBounds).toHaveBeenCalledOnce();
		expect(map.minZoom).toBe(6);
		expect(map.container.dataset.mapMinZoom).toBe("6");
		expect(FakeResizeObserver.instances[0].observe).toHaveBeenCalled();
		const limitCalls = map.cameraForBounds.mock.calls.length;
		act(() => FakeResizeObserver.instances[0].trigger());
		expect(map.resize).toHaveBeenCalled();
		expect(map.cameraForBounds).toHaveBeenCalledTimes(limitCalls + 1);
		view.unmount();
		expect(map.remove).toHaveBeenCalledOnce();
		expect(popup.open).toBe(false);
		expect(FakeResizeObserver.instances[0].disconnect).toHaveBeenCalledOnce();
		expect(
			fake.Marker.instances
				.filter((marker) => marker.options.anchor === "bottom")
				.every((marker) => marker.removed),
		).toBe(true);
	});

	it("fits filtered bells but does not move the camera when the sidebar toggles", async () => {
		const view = renderMap();
		const map = await readyMap();
		const initialFits = map.fitBounds.mock.calls.length;
		view.rerender(<Harness {...view.props} sidebarOpen />);
		expect(map.fitBounds).toHaveBeenCalledTimes(initialFits);
		expect(map.easeTo).not.toHaveBeenCalled();
		view.rerender(<Harness {...view.props} bells={[west]} />);
		expect(map.easeTo).toHaveBeenCalledWith(
			expect.objectContaining({ center: [-80, 40], zoom: 12 }),
		);
	});

	it("opens a bell popup on hover, highlights markers, and closes on departure", async () => {
		const view = renderMap();
		await readyMap();
		await waitFor(() => expect(bellMarker("west")).toBeTruthy());
		const marker = bellMarker("west");
		const popup = last(fake.Popup.instances);
		act(() => marker.element.dispatchEvent(new MouseEvent("mouseenter")));
		expect(current.popupBell?.id).toBe("west");
		expect(popup.open).toBe(true);
		expect(popup.lngLat).toEqual([-80, 40]);
		act(() =>
			marker.element.dispatchEvent(
				new MouseEvent("mouseleave", { relatedTarget: popup.element }),
			),
		);
		expect(popup.open).toBe(true);
		act(() => view.highlightRef.current?.("west"));
		expect(marker.element.className).toContain("highlighted");
		act(() => current.handlePopupMouseLeave(marker.element));
		expect(popup.open).toBe(true);
		act(() => current.handlePopupMouseLeave(document.createElement("div")));
		expect(current.popupBell).toBeUndefined();
		expect(popup.open).toBe(false);
	});

	it("selects individual markers and expands clusters", async () => {
		const onBellSelect = vi.fn();
		const view = renderMap({ onBellSelect });
		const map = await readyMap();
		act(() => bellMarker("west").element.click());
		expect(onBellSelect).toHaveBeenCalledWith("west");

		view.rerender(
			<Harness
				{...view.props}
				bells={[bell("near-a", 40, -77), bell("near-b", 40.0001, -77.0001)]}
			/>,
		);
		const cluster = fake.Marker.instances.find(
			(marker) => marker.options.anchor === "center" && !marker.removed,
		);
		expect(cluster?.element.getAttribute("aria-label")).toBe("Zoom to 2 bells");
		act(() => cluster?.element.click());
		expect(map.easeTo).toHaveBeenCalledWith(
			expect.objectContaining({
				center: expect.any(Array),
				zoom: expect.any(Number),
			}),
		);
	});

	it("selects bells and opens the popup after movement only when the sidebar is closed", async () => {
		const view = renderMap({ sidebarOpen: true, selectedBellId: "west" });
		const map = await readyMap();
		expect(map.flyTo).toHaveBeenCalledWith(
			expect.objectContaining({ center: [-80, 40], zoom: 14 }),
		);
		expect(current.popupBell).toBeUndefined();
		view.rerender(<Harness {...view.props} sidebarOpen={false} />);
		expect(current.popupBell?.id).toBe("west");
		view.rerender(
			<Harness {...view.props} sidebarOpen selectedBellId="west" />,
		);
		expect(current.popupBell).toBeUndefined();
	});

	it("opens the selected bell after movement when the sidebar is closed", async () => {
		renderMap({ selectedBellId: "east" });
		const map = await readyMap();
		act(() => map.emit("moveend"));
		expect(current.popupBell?.id).toBe("east");
	});

	it("caps zooming out at the state view", async () => {
		renderMap();
		const map = await readyMap();
		expect(current.atZoomOutLimit).toBe(true);
		act(() => current.zoom(1));
		expect(map.zoom).toBe(7);
		expect(current.atZoomOutLimit).toBe(false);
		act(() => current.zoom(-10));
		expect(map.zoom).toBe(6);
		expect(current.atZoomOutLimit).toBe(true);
	});

	it("shows a location error and dismisses it", async () => {
		renderMap();
		await readyMap();
		const original = navigator.geolocation;
		Object.defineProperty(navigator, "geolocation", {
			configurable: true,
			value: undefined,
		});
		act(() => current.locate());
		expect(current.locationWarning).toBeTruthy();
		act(() => current.dismissLocationWarning());
		expect(current.locationWarning).toBeNull();
		Object.defineProperty(navigator, "geolocation", {
			configurable: true,
			value: original,
		});
	});

	it("reports a denied location request", async () => {
		renderMap();
		await readyMap();
		let fail: PositionErrorCallback | undefined;
		Object.defineProperty(navigator, "geolocation", {
			configurable: true,
			value: {
				getCurrentPosition: vi.fn(
					(_success: PositionCallback, error: PositionErrorCallback) => {
						fail = error;
					},
				),
			},
		});
		act(() => current.locate());
		expect(current.locating).toBe(true);
		act(() => fail?.({ code: 1 } as GeolocationPositionError));
		expect(current.locating).toBe(false);
		expect(current.locationWarning).toContain("Location access is blocked");
	});

	it("flies to the user's location and reuses its marker on later requests", async () => {
		const view = renderMap();
		const map = await readyMap();
		let success: PositionCallback | undefined;
		Object.defineProperty(navigator, "geolocation", {
			configurable: true,
			value: {
				getCurrentPosition: vi.fn((callback: PositionCallback) => {
					success = callback;
				}),
			},
		});
		act(() => current.locate());
		expect(current.locating).toBe(true);
		act(() =>
			success?.({
				coords: { latitude: 40.3, longitude: -76.9 },
			} as GeolocationPosition),
		);
		expect(current.locating).toBe(false);
		expect(map.flyTo).toHaveBeenCalledWith(
			expect.objectContaining({ center: [-76.9, 40.3], zoom: 14 }),
		);
		expect(
			fake.Marker.instances.filter((marker) =>
				marker.element.querySelector("[data-location-marker]"),
			).length,
		).toBe(1);
		act(() => current.locate());
		act(() =>
			success?.({
				coords: { latitude: 41, longitude: -77 },
			} as GeolocationPosition),
		);
		expect(
			fake.Marker.instances.filter((marker) =>
				marker.element.querySelector("[data-location-marker]"),
			).length,
		).toBe(1);
		const locationMarker = fake.Marker.instances.find((marker) =>
			marker.element.querySelector("[data-location-marker]"),
		);
		view.unmount();
		expect(locationMarker?.removed).toBe(true);
	});

	it("keeps popups closed on mobile and uses mobile camera padding", async () => {
		renderMap({ isMobile: true, selectedBellId: "west" });
		const map = await readyMap();
		expect(map.flyTo).toHaveBeenCalledWith(
			expect.objectContaining({ offset: [0, -16] }),
		);
		await waitFor(() => expect(bellMarker("west")).toBeTruthy());
		act(() =>
			bellMarker("west").element.dispatchEvent(new MouseEvent("mouseenter")),
		);
		expect(current.popupBell).toBeUndefined();
	});
});
