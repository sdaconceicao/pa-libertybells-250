import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Bell } from "../../../lib/bells/types";
import { BellSearch } from "./BellSearch";

function makeBell(overrides: Partial<Bell> & Pick<Bell, "id" | "title">): Bell {
	return {
		county: "York",
		address: { city: "York", zip: "17401" },
		sourceSlug: "test",
		lat: 40,
		lng: -77,
		...overrides,
		id: overrides.id,
		title: overrides.title,
	};
}

describe("BellSearch", () => {
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it("renders a search input", () => {
		render(<BellSearch bells={[]} />);

		expect(
			screen.getByRole("searchbox", {
				name: "Search bells by title or artist",
			}),
		).not.toBeNull();
	});

	it("shows matching bells in a suggestions list", async () => {
		const user = userEvent.setup();
		const bells = [
			makeBell({ id: "a", title: "Gettysburg Bell", artist: "Jane Smith" }),
			makeBell({ id: "b", title: "Philadelphia Liberty", artist: "John Doe" }),
		];

		render(<BellSearch bells={bells} />);

		await user.type(screen.getByRole("searchbox"), "gettysburg");

		expect(
			await screen.findByRole("listbox", { name: "Suggestions" }),
		).not.toBeNull();
		expect(await screen.findByText("Gettysburg Bell")).not.toBeNull();
		expect(screen.queryByText("Philadelphia Liberty")).toBeNull();
	});

	it("matches artists and selects a bell", async () => {
		const user = userEvent.setup();
		const onBellSelect = vi.fn();
		const bells = [
			makeBell({ id: "a", title: "Gettysburg Bell", artist: "Jane Smith" }),
			makeBell({ id: "b", title: "Philadelphia Liberty", artist: "John Doe" }),
		];

		render(<BellSearch bells={bells} onBellSelect={onBellSelect} />);

		const input = screen.getByRole("searchbox") as HTMLInputElement;
		await user.type(input, "john");
		await user.click(await screen.findByText("Philadelphia Liberty"));

		expect(onBellSelect).toHaveBeenCalledWith("b");
		expect(input.value).toBe("");
	});

	it("shows an empty message when nothing matches", async () => {
		const user = userEvent.setup();
		render(
			<BellSearch bells={[makeBell({ id: "a", title: "Gettysburg Bell" })]} />,
		);

		await user.type(screen.getByRole("searchbox"), "zanzibar");

		expect(await screen.findByText("No results found.")).not.toBeNull();
	});

	it("selects a bell with arrow keys and enter", async () => {
		const user = userEvent.setup();
		const onBellSelect = vi.fn();
		const bells = [
			makeBell({
				id: "a",
				title: "Gettysburg Liberty Bell",
				artist: "Jane Smith",
			}),
			makeBell({ id: "b", title: "Philadelphia Liberty", artist: "John Doe" }),
		];

		render(<BellSearch bells={bells} onBellSelect={onBellSelect} />);

		const input = screen.getByRole("searchbox");
		await user.type(input, "liberty");
		// Wait for the suggestions to load before navigating them.
		await screen.findByRole("option", { name: /Gettysburg Liberty Bell/i });

		await user.keyboard("{ArrowDown}{Enter}");

		expect(onBellSelect).toHaveBeenCalledWith("a");
	});
});
