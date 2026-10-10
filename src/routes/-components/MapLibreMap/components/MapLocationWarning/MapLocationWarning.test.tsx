import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MapLocationWarning } from "./MapLocationWarning";

describe("MapLocationWarning", () => {
	afterEach(cleanup);

	it("renders nothing without a message", () => {
		const { container } = render(
			<MapLocationWarning message={null} onDismiss={vi.fn()} />,
		);
		expect(container.firstChild).toBeNull();
	});

	it("announces and dismisses a location error", () => {
		const onDismiss = vi.fn();
		render(
			<MapLocationWarning
				message="Location unavailable"
				onDismiss={onDismiss}
			/>,
		);
		expect(screen.getByRole("alert").textContent).toContain(
			"Location unavailable",
		);
		fireEvent.click(
			screen.getByRole("button", { name: "Dismiss location warning" }),
		);
		expect(onDismiss).toHaveBeenCalledOnce();
	});
});
