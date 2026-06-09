import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Image } from "./Image";

describe("Image", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders a static placeholder when src is missing", () => {
		render(<Image alt="Test image" />);

		expect(screen.getByTestId("image-placeholder")).toBeTruthy();
		expect(screen.queryByRole("img")).toBeNull();
	});

	it("renders a loading placeholder and image when src is provided", () => {
		render(<Image src="/images/test.png" alt="Test image" />);

		expect(screen.getByTestId("image-placeholder")).toBeTruthy();
		const image = screen.getByRole("img", { name: "Test image" });
		expect(image.getAttribute("src")).toBe("/images/test.png");
	});

	it("hides the loading placeholder after the image loads", () => {
		const { container } = render(
			<Image src="/images/test.png" alt="Test image" />,
		);

		const image = screen.getByRole("img", { name: "Test image" });
		fireEvent.load(image);

		const placeholder = container.querySelector(
			'[data-testid="image-placeholder"]',
		);
		expect(placeholder).toBeTruthy();
		expect(placeholder?.className).toContain("placeholderHidden");
	});

	it("shows a static placeholder when the image fails to load", () => {
		render(<Image src="/images/test.png" alt="Test image" />);

		const image = screen.getByRole("img", { name: "Test image" });
		fireEvent.error(image);

		expect(screen.getByTestId("image-placeholder")).toBeTruthy();
		expect(screen.queryByRole("img")).toBeNull();
	});
});
