import React, { useState } from 'react';
import Image from 'next/image';

const SafeImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackSrc = '/author-avatar.svg',
  priority = false,
  fill = false,
  sizes,
  ...props
}) => {
  const isSvg = (imageSrc) =>
    imageSrc?.includes('.svg') || imageSrc?.includes('data:image/svg');

  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retried, setRetried] = useState(false);

  const handleError = () => {
    if (!retried && imageSrc !== fallbackSrc) {
      setRetried(true);
      setImageSrc(fallbackSrc);
      return;
    }
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
        {...props}
      >
        <div className="text-center">
          <svg
            className="w-12 h-12 text-medium-text-muted mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs text-medium-text-muted">Image not available</p>
        </div>
      </div>
    );
  }

  const imageProps = {
    src: imageSrc,
    alt: alt || 'Image',
    onError: handleError,
    onLoad: handleLoad,
    priority,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    placeholder: 'blur',
    blurDataURL:
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
    ...((isSvg(imageSrc) || imageSrc?.includes('localhost')) && {
      unoptimized: true,
    }),
    ...props,
  };

  if (fill) {
    return <Image {...imageProps} fill sizes={sizes} />;
  }

  return (
    <Image
      {...imageProps}
      width={width || 400}
      height={height || 300}
      sizes={sizes}
    />
  );
};

export default SafeImage;
