import React, { useState } from "react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const ImageWithFallback: React.FC<ImageProps> = ({
  src,
  alt,
  className,
  fallbackSrc = "https://placehold.co/400x400/png?text=Loading",
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <>
      {!loaded && !error && (
        <div
          className={`absolute inset-0 animate-pulse bg-gray-200 ${className?.replace(/hover:[^\s]+/g, "").replace(/transition[^\s]*/g, "")}`}
        />
      )}
      <img
        src={error ? fallbackSrc : src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        {...props}
      />
    </>
  );
};
