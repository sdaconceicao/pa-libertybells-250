import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BellVisitStatus } from "./BellVisitStatus";

// react-aria's combobox uses a couple of browser APIs that jsdom does not
// implement when it opens/scrolls the listbox popover. Polyfill them so the
// dropdown can render during tests.
if (typeof globalThis.CSS === "undefined") {
	// @ts-expect-error minimal shim: react-aria only needs CSS.escape here.
	globalThis.CSS = { escape: (value: string) => value };
}
if (!Element.prototype.scrollIntoView) {
	Element.prototype.scrollIntoView = () => {};
}

// Rendered without providers, the context hooks fall back to their signed-out
// defaults, so the control shows the placeholder and all status options.
describe("BellVisitStatus", () => {
	afterEach(() => {
		cleanup();
	});

	it("shows the 'Visited?' placeholder when signed out", () => {
		render(<BellVisitStatus bellId="a" />);

		const combobox = screen.getByRole("combobox", { name: "Visited status" });
		expect((combobox as HTMLInputElement).value).toBe("Visited?");
	});

	it("offers the want, been, and placeholder options", async () => {
		render(<BellVisitStatus bellId="a" />);

		fireEvent.click(screen.getByRole("button", { name: "Show suggestions" }));

		expect(
			await screen.findByRole("option", { name: "Visited?" }),
		).toBeTruthy();
		expect(screen.getByRole("option", { name: "Want to go" })).toBeTruthy();
		expect(screen.getByRole("option", { name: "Been there" })).toBeTruthy();
	});
});
