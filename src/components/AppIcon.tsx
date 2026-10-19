import React from 'react';

interface AppIconProps {
  name?: string;
  className?: string;
  fallback?: string;
  alt?: string;
}

/**
 * Universal Icon Component for Parmis Dental Clinic
 * Supports both:
 * 1. Google Material Symbols (e.g. "dentistry", "verified", "biotech")
 * 2. Uploaded Custom Icons (SVG, PNG, WebP) (e.g. "/uploads/my-icon.svg", "data:image/svg+xml;...")
 */
export const AppIcon: React.FC<AppIconProps> = ({
  name,
  className = '',
  fallback = 'dentistry',
  alt = 'آیکون',
}) => {
  const iconValue = name?.trim() || fallback;

  // Check if icon is an uploaded image file path or data URI
  const isCustomFile =
    iconValue.startsWith('/') ||
    iconValue.startsWith('http://') ||
    iconValue.startsWith('https://') ||
    iconValue.startsWith('data:image/');

  if (isCustomFile) {
    return (
      <img
        src={iconValue}
        alt={alt}
        className={`object-contain inline-block shrink-0 select-none ${className}`}
        loading="lazy"
        onError={(e) => {
          // If custom image failed to load, fallback to Material Symbol
          const target = e.currentTarget;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            const span = document.createElement('span');
            span.className = `material-symbols-outlined ${className}`;
            span.innerText = fallback;
            parent.appendChild(span);
          }
        }}
      />
    );
  }

  return (
    <span className={`material-symbols-outlined select-none shrink-0 ${className}`}>
      {iconValue}
    </span>
  );
};
