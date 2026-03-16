import Image from "next/image";
import { cn } from "@/lib/utils";
import { urlForImage } from "@/sanity/lib/image";
import type { SanityImage as SanityImageType } from "@/sanity/lib/types";

type SanityImageProps = {
  image?: SanityImageType | null;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

export function SanityImage({
  image,
  alt,
  width,
  height,
  sizes,
  priority = false,
  className,
}: SanityImageProps) {
  if (!image?.asset) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-[1.75rem] bg-secondary text-sm text-muted-foreground",
          className
        )}
        style={{ minHeight: `${Math.min(height, 320)}px` }}
      >
        Image placeholder
      </div>
    );
  }

  const src = urlForImage(image)?.width(width * 2).height(height * 2).url();

  if (!src) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={image.alt ?? alt}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}
