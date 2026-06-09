import type { SyntheticEvent } from "react";
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
	const placeholderClassNameCombined = [
		styles.placeholder,
		src ? styles.placeholderLoading : "",
		placeholderClassName,
	]
		.filter(Boolean)
		.join(" ");

	const wrapperClassName = [styles.wrapper, className]
		.filter(Boolean)
		.join(" ");
	const imageClassNameCombined = [styles.image, imageClassName]
		.filter(Boolean)
		.join(" ");

	const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
		event.currentTarget.classList.add(styles.imageLoaded);
		event.currentTarget.parentElement?.classList.add(styles.wrapperLoaded);
	};

	const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
		const image = event.currentTarget;
		const wrapper = image.parentElement;
		image.remove();
		wrapper?.classList.remove(styles.wrapperLoaded);
		wrapper
			?.querySelector('[data-testid="image-placeholder"]')
			?.classList.remove(styles.placeholderLoading);
	};

	return (
		<div className={wrapperClassName}>
			<div
				className={placeholderClassNameCombined}
				aria-hidden="true"
				data-testid="image-placeholder"
			/>
			{src ? (
				<img
					src={src}
					alt={alt}
					className={imageClassNameCombined}
					width={width}
					height={height}
					loading={loading}
					decoding={decoding}
					onLoad={handleLoad}
					onError={handleError}
				/>
			) : null}
		</div>
	);
}
