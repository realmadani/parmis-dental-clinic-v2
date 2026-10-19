import React from 'react';

/**
 * Checks whether a URL or filename points to a video resource.
 */
export const isVideoUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  const cleanUrl = url.split('?')[0].toLowerCase().trim();
  return (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.m4v') ||
    cleanUrl.endsWith('.mkv') ||
    cleanUrl.endsWith('.avi') ||
    url.includes('/video/') ||
    url.includes('video/mp4') ||
    url.includes('video/webm')
  );
};

interface MediaPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  className?: string;
  imgClassName?: string;
  videoClassName?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  fallbackText?: string;
}

/**
 * Reusable Media preview component that automatically detects video vs image
 * and supports smooth autoplay, looping, and controls.
 */
export const MediaPreview: React.FC<MediaPreviewProps> = ({
  src,
  alt = 'رسانه',
  className = 'w-full h-full object-cover',
  imgClassName,
  videoClassName,
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
  playsInline = true,
  fallbackText = 'بدون رسانه',
  ...rest
}) => {
  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 select-none">
        {fallbackText}
      </div>
    );
  }

  if (isVideoUrl(src)) {
    return (
      <video
        src={src}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline={playsInline}
        className={videoClassName || className}
        {...(rest as any)}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={imgClassName || className}
      loading="lazy"
      {...(rest as any)}
    />
  );
};
