import { act, renderHook } from "@testing-library/react";
import type { Marker as LeafletMarker } from "leaflet";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import markerStyles from "../components/Marker/Marker.module.css";
import { useBellMarkerHandlers } from "./useBellMarkerHandlers";

function makeMockMarker(): LeafletMarker {
	const element = document.createElement("div");
	return {
		getElement: () => element,
	} as unknown as LeafletMarker;
}

describe("useBellMarkerHandlers", () => {
	it("registers and unregisters marker refs", () => {
		const highlightRef = createRef<((id: string | null) => void) | null>();
		const { result } = renderHook(() => useBellMarkerHandlers(highlightRef));
		const marker = makeMockMarker();

		act(() => {
			result.current.registerMarkerRef("a", marker);
		});
		expect(result.current.markerRefs.current.get("a")).toBe(marker);

		act(() => {
			result.current.registerMarkerRef("a", null);
		});
		expect(result.current.markerRefs.current.has("a")).toBe(false);
	});

	it("adds and removes the highlight class on marker elements", () => {
		const highlightRef = createRef<((id: string | null) => void) | null>();
		const { result } = renderHook(() => useBellMarkerHandlers(highlightRef));
		const markerA = makeMockMarker();
		const markerB = makeMockMarker();

		act(() => {
			result.current.registerMarkerRef("a", markerA);
			result.current.registerMarkerRef("b", markerB);
		});

		act(() => {
			result.current.setMarkerHighlight("a");
		});

		expect(markerA.getElement()?.classList.contains(markerStyles.bellMarkerHighlighted)).toBe(
			true,
		);
		expect(markerB.getElement()?.classList.contains(markerStyles.bellMarkerHighlighted)).toBe(
			false,
		);

		act(() => {
			result.current.setMarkerHighlight("b");
		});

		expect(markerA.getElement()?.classList.contains(markerStyles.bellMarkerHighlighted)).toBe(
			false,
		);
		expect(markerB.getElement()?.classList.contains(markerStyles.bellMarkerHighlighted)).toBe(
			true,
		);

		act(() => {
			result.current.setMarkerHighlight(null);
		});

		expect(markerA.getElement()?.classList.contains(markerStyles.bellMarkerHighlighted)).toBe(
			false,
		);
		expect(markerB.getElement()?.classList.contains(markerStyles.bellMarkerHighlighted)).toBe(
			false,
		);
	});

	it("wires highlightRef to setMarkerHighlight and clears on unmount", () => {
		const highlightRef = createRef<((id: string | null) => void) | null>();
		const { result, unmount } = renderHook(() =>
			useBellMarkerHandlers(highlightRef),
		);

		expect(highlightRef.current).toBe(result.current.setMarkerHighlight);

		unmount();

		expect(highlightRef.current).toBeNull();
	});

	it("updates highlight through highlightRef", () => {
		const highlightRef = createRef<((id: string | null) => void) | null>();
		const { result } = renderHook(() => useBellMarkerHandlers(highlightRef));
		const marker = makeMockMarker();

		act(() => {
			result.current.registerMarkerRef("a", marker);
		});

		act(() => {
			highlightRef.current?.("a");
		});

		expect(marker.getElement()?.classList.contains(markerStyles.bellMarkerHighlighted)).toBe(
			true,
		);
	});
});
