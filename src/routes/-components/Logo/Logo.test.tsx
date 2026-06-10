import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Logo } from "./Logo";

describe("Logo", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders the wide variant", () => {
		render(<Logo variant="wide" />);

		const logo = screen.getByTestId("logo-wide");
		expect(logo.getAttribute("alt")).toBe("Bells Across PA");
		expect(logo.className).toMatch(/wide/);
	});

	it("renders the circle variant", () => {
		render(<Logo variant="circle" alt="Bells Across Pennsylvania" />);

		const logo = screen.getByTestId("logo-circle");
		expect(logo.getAttribute("alt")).toBe("Bells Across Pennsylvania");
		expect(logo.className).toMatch(/circle/);
	});

	it("applies a custom class name", () => {
		render(<Logo variant="wide" className="custom-logo" />);

		expect(screen.getByTestId("logo-wide").className).toContain("custom-logo");
	});
});
