import { useEffect, useState } from "react";

type Range = {
	start: number;
	end: number;
};

type Options = {
	itemCount: number;
	itemHeight: number;
	overscan: number;
	scrollElement: HTMLElement | null;
};

export function getVirtualListRange(
	scrollTop: number,
	viewportHeight: number,
	itemCount: number,
	itemHeight: number,
	overscan: number,
): Range {
	if (itemCount === 0) {
		return { start: 0, end: 0 };
	}

	const start = Math.max(
		0,
		Math.floor(scrollTop / itemHeight) - overscan,
	);
	const visibleCount = Math.ceil(viewportHeight / itemHeight) + overscan * 2;
	const end = Math.min(itemCount, start + visibleCount);

	return { start, end };
}

export function useVirtualListRange({
	itemCount,
	itemHeight,
	overscan,
	scrollElement,
}: Options): Range {
	const [range, setRange] = useState<Range>({ start: 0, end: 0 });

	useEffect(() => {
		if (!scrollElement || itemCount === 0) {
			setRange({ start: 0, end: 0 });
			return;
		}

		const updateRange = () => {
			const next = getVirtualListRange(
				scrollElement.scrollTop,
				scrollElement.clientHeight,
				itemCount,
				itemHeight,
				overscan,
			);

			setRange((current) =>
				current.start === next.start && current.end === next.end
					? current
					: next,
			);
		};

		updateRange();
		scrollElement.addEventListener("scroll", updateRange, { passive: true });
		window.addEventListener("resize", updateRange);

		return () => {
			scrollElement.removeEventListener("scroll", updateRange);
			window.removeEventListener("resize", updateRange);
		};
	}, [itemCount, itemHeight, overscan, scrollElement]);

	return range;
}
