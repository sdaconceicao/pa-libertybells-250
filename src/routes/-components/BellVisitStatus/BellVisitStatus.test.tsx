import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BellVisitStatus } from "./BellVisitStatus";

// Rendered without providers, the context hooks fall back to their signed-out
// defaults, so the control shows the placeholder and all status options.
describe("BellVisitStatus", () => {
	afterEach(() => {
		cleanup();
	});

	it("shows the 'Visited?' placeholder when signed out", () => {
		render(<BellVisitStatus bellId="a" />);

		const select = screen.getByRole("combobox", { name: "Visited status" });
		expect((select as HTMLSelectElement).value).toBe("none");
	});

	it("offers the want, been, and placeholder options", () => {
		render(<BellVisitStatus bellId="a" />);

		expect(screen.getByRole("option", { name: "Visited?" })).toBeTruthy();
		expect(screen.getByRole("option", { name: "Want to go" })).toBeTruthy();
		expect(screen.getByRole("option", { name: "Been there" })).toBeTruthy();
	});
});
