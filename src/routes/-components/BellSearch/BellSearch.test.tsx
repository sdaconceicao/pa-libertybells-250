import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Bell } from "../../../lib/bells/types";
import { BellSearch } from "./BellSearch";
import styles from "../BellContent/BellContent.module.css";

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
			screen.getByRole("combobox", { name: "Search bells by title or artist" }),
		).not.toBeNull();
	});

	it("shows matching bells in a scrollable results list", () => {
		const bells = [
			makeBell({ id: "a", title: "Gettysburg Bell", artist: "Jane Smith" }),
			makeBell({ id: "b", title: "Philadelphia Liberty", artist: "John Doe" }),
		];

		render(<BellSearch bells={bells} />);

		fireEvent.change(
			screen.getByRole("combobox", { name: "Search bells by title or artist" }),
			{ target: { value: "gettysburg" } },
		);

		expect(
			screen.getByRole("listbox", { name: "Bell search results" }),
		).not.toBeNull();
		expect(screen.getByText("Gettysburg Bell")).not.toBeNull();
		expect(screen.queryByText("Philadelphia Liberty")).toBeNull();
	});

	it("matches artists and selects a bell", () => {
		const onBellSelect = vi.fn();
		const bells = [
			makeBell({ id: "a", title: "Gettysburg Bell", artist: "Jane Smith" }),
			makeBell({ id: "b", title: "Philadelphia Liberty", artist: "John Doe" }),
		];

		render(<BellSearch bells={bells} onBellSelect={onBellSelect} />);

		const input = screen.getByRole("combobox", {
			name: "Search bells by title or artist",
		});
		fireEvent.change(input, { target: { value: "john" } });
		fireEvent.click(screen.getByText("Philadelphia Liberty"));

		expect(onBellSelect).toHaveBeenCalledWith("b");
		expect((input as HTMLInputElement).value).toBe("");
	});

	it("shows an empty message when nothing matches", () => {
		render(
			<BellSearch bells={[makeBell({ id: "a", title: "Gettysburg Bell" })]} />,
		);

		fireEvent.change(
			screen.getByRole("combobox", { name: "Search bells by title or artist" }),
			{ target: { value: "zanzibar" } },
		);

		expect(screen.getByText("No bells match your search.")).not.toBeNull();
	});

	it("selects a bell with arrow keys and enter", () => {
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

		const input = screen.getByRole("combobox", {
			name: "Search bells by title or artist",
		});
		fireEvent.change(input, { target: { value: "liberty" } });
		fireEvent.keyDown(input, { key: "ArrowDown" });

		const activeEntry = screen.getByRole("option", {
			name: /Gettysburg Liberty Bell/i,
		});
		expect(activeEntry.className).toContain(styles.entryActive);

		fireEvent.keyDown(input, { key: "Enter" });

		expect(onBellSelect).toHaveBeenCalledWith("a");
	});
});
