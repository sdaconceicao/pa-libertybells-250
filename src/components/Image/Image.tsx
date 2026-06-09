import { useLayoutEffect, useRef, useState } from "react";
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

function ImageInner({
	src,
	alt,
	className,
	imageClassName,
	placeholderClassName,
	width,
	height,
	loading = "lazy",
	decoding = "async",
}: Props & { src: string }) {
	const [loaded, setLoaded] = useState(false);
	const [error, setError] = useState(false);
	const imgRef = useRef<HTMLImageElement>(null);

	useLayoutEffect(() => {
		const img = imgRef.current;
		if (img?.complete && img.naturalWidth > 0) {
			setLoaded(true);
		}
	}, []);

	const placeholderClassNameCombined = [
		styles.placeholder,
		!error && !loaded ? styles.placeholderLoading : "",
		loaded ? styles.placeholderHidden : "",
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
			<div
				className={placeholderClassNameCombined}
				aria-hidden="true"
				data-testid="image-placeholder"
			/>
			{!error ? (
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

export function Image({ src, ...props }: Props) {
	if (!src) {
		const placeholderClassNameCombined = [
			styles.placeholder,
			props.placeholderClassName,
		]
			.filter(Boolean)
			.join(" ");
		const wrapperClassName = [styles.wrapper, props.className]
			.filter(Boolean)
			.join(" ");

		return (
			<div className={wrapperClassName}>
				<div
					className={placeholderClassNameCombined}
					aria-hidden="true"
					data-testid="image-placeholder"
				/>
			</div>
		);
	}

	return <ImageInner key={src} src={src} {...props} />;
}
