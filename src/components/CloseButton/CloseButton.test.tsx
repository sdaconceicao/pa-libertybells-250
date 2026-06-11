import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CloseButton } from "./CloseButton";

describe("CloseButton", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders with the default close label", () => {
		render(<CloseButton onClick={() => {}} />);

		expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
	});

	it("renders with a custom label", () => {
		render(
			<CloseButton label="Close selected bell" onClick={() => {}} />,
		);

		expect(
			screen.getByRole("button", { name: "Close selected bell" }),
		).toBeTruthy();
	});

	it("calls onClick when clicked", () => {
		const onClick = vi.fn();

		render(<CloseButton onClick={onClick} />);

		fireEvent.click(screen.getByRole("button", { name: "Close" }));

		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("applies overlay variant class", () => {
		const { container } = render(
			<CloseButton variant="overlay" onClick={() => {}} />,
		);

		expect(container.querySelector("button")?.className).toMatch(/overlay/);
	});

	it("respects disabled state", () => {
		const onClick = vi.fn();

		render(<CloseButton disabled onClick={onClick} />);

		const button = screen.getByRole("button", { name: "Close" });
		expect(button).toHaveProperty("disabled", true);

		fireEvent.click(button);

		expect(onClick).not.toHaveBeenCalled();
	});
});
