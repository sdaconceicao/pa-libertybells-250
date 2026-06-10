export function isMovingToElement(
	relatedTarget: EventTarget | null,
	container: HTMLElement | undefined,
): boolean {
	return relatedTarget instanceof Node && !!container?.contains(relatedTarget);
}
