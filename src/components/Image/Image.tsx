import { useEffect, useRef, useState } from "react";
import styles from "./Image.module.css";

type Props = {
	src?: string;
	alt: string;
	className?: string;
	imageClassName?: string;
	placeholderClassName?: string;
	width?: number;
	height?: number;
	loading?: "lazy" | "eager";
	decoding?: "async" | "auto" | "sync";
};

export function Image({
	src,
	alt,
	className,
	imageClassName,
	placeholderClassName,
	width,
	height,
	loading = "lazy",
	decoding = "async",
}: Props) {
	const [loaded, setLoaded] = useState(false);
	const [error, setError] = useState(false);
	const imgRef = useRef<HTMLImageElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset and recheck cache when src changes
	useEffect(() => {
		setLoaded(false);
		setError(false);

		const img = imgRef.current;
		if (img?.complete && img.naturalWidth > 0) {
			setLoaded(true);
		}
	}, [src]);

	const showImage = Boolean(src) && !error;
	const showPlaceholder = !showImage || !loaded;

	const placeholderClassNameCombined = [
		styles.placeholder,
		showImage && !loaded ? styles.placeholderLoading : "",
		placeholderClassName,
	]
		.filter(Boolean)
		.join(" ");

	const wrapperClassName = [styles.wrapper, className]
		.filter(Boolean)
		.join(" ");
	const imageClassNameCombined = [
		styles.image,
		loaded ? styles.imageLoaded : "",
		imageClassName,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={wrapperClassName}>
			{showPlaceholder ? (
				<div
					className={placeholderClassNameCombined}
					aria-hidden="true"
					data-testid="image-placeholder"
				/>
			) : null}
			{showImage ? (
				<img
					ref={imgRef}
					src={src}
					alt={alt}
					className={imageClassNameCombined}
					width={width}
					height={height}
					loading={loading}
					decoding={decoding}
					onLoad={() => setLoaded(true)}
					onError={() => setError(true)}
				/>
			) : null}
		</div>
	);
}
