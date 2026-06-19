/**
 * Derive up to two uppercase initials for an avatar.
 * "John Doe" -> "JD", "ada" -> "A", "jane@example.com" -> "J".
 */
export function getInitials(
	name?: string | null,
	email?: string | null,
): string {
	const source = name?.trim() || email?.split("@")[0]?.trim() || "";
	if (!source) return "?";

	const parts = source.split(/[\s._-]+/).filter(Boolean);
	if (parts.length === 0) return source.charAt(0).toUpperCase();
	if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
	return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
