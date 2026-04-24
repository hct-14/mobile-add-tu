import React, { useState, useRef, useEffect, useMemo } from "react";
import { isCloudinaryUrl, getTransformedUrl } from "../lib/cloudinaryUpload";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  placeholderColor?: string;
  useBlur?: boolean;
  quality?: 'auto' | number;
  size?: number;
}

export const ImageWithFallback: React.FC<ImageProps> = ({
  src,
  alt,
  className,
  fallbackSrc = "https://placehold.co/400x400/webp?text=Loading",
  placeholderColor = "bg-gray-100",
  useBlur = true,
  loading,
  fetchPriority,
  quality = 'auto',
  size,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Generate low-quality blur placeholder for Cloudinary
  const blurSrc = useMemo(() => {
    if (!src || !isCloudinaryUrl(src)) return src;
    return getTransformedUrl(src, {
      width: 20,
      quality: 10,
      format: 'webp'
    });
  }, [src]);

  // Optimize main image URL with WebP format for best performance
  const optimizedSrc = useMemo(() => {
    if (!src) return src;
    if (isCloudinaryUrl(src)) {
      return getTransformedUrl(src, {
        quality: quality,
        ...(size ? { width: size } : {}),
        format: 'webp'
      });
    }
    return src;
  }, [src, quality, size]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === "eager" || fetchPriority === "high") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px 0px",
        threshold: 0,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [loading, fetchPriority]);

  const shouldLoadImage = inView || loading === "eager" || fetchPriority === "high";
  const finalSrc = error ? fallbackSrc : optimizedSrc;

  // Filter out hover and transition classes from placeholder
  const filteredClassName = className
    ?.replace(/hover:[^\s]+/g, "")
    .replace(/transition[^\s]*/g, "") || "";

  return (
    <div ref={imgRef} className="relative overflow-hidden">
      {/* Placeholder - visible until image loads */}
      {(!loaded || error) && (
        <div
          className={`absolute inset-0 ${placeholderColor} ${
            loaded && useBlur ? "animate-pulse" : ""
          }`}
        />
      )}

      {/* Blur placeholder effect - only show while loading, use tiny version */}
      {useBlur && !error && !loaded && blurSrc && (
        <div
          className={`absolute inset-0 ${filteredClassName}`}
          style={{
            backgroundImage: `url(${blurSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(10px)",
            transform: "scale(1.2)",
            opacity: 0.6,
          }}
        />
      )}

      {/* Actual image */}
      {shouldLoadImage && (
        <img
          src={finalSrc}
          alt={alt}
          className={`${className} transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setError(true);
            setLoaded(true);
          }}
          loading={loading}
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
};

// Simple lightweight image for thumbnails
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}> = ({ src, alt, className = "", aspectRatio = "1/1" }) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Optimize Cloudinary URLs with WebP format
  const optimizedSrc = useMemo(() => {
    if (!src) return src;
    if (isCloudinaryUrl(src)) {
      return getTransformedUrl(src, { quality: 'auto', format: 'webp' });
    }
    return src;
  }, [src]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px 0px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ aspectRatio }}>
      {!loaded && <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-md" />}
      {inView && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={`w-full h-full object-cover rounded-md transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
};
