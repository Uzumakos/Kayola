import React, { useState, useEffect } from 'react';
import { store } from '../../lib/store';
import { GallerySettings } from '../../types';

interface KayolaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only' | 'light';
  className?: string;
}

export const KayolaLogo: React.FC<KayolaLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
}) => {
  const [settings, setSettings] = useState<GallerySettings>(() => store.getSettings());
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setSettings(store.getSettings());
      setImgError(false);
    });
    return unsubscribe;
  }, []);

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const imgHeights = {
    sm: 'h-7 max-w-[120px]',
    md: 'h-9 max-w-[160px]',
    lg: 'h-12 max-w-[200px]',
    xl: 'h-16 max-w-[260px]',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const hasCustomLogo = Boolean(settings.logo_url && settings.logo_url.trim() && !imgError);

  // If custom logo image is provided and valid
  if (hasCustomLogo && settings.logo_url) {
    if (variant === 'icon-only') {
      return (
        <div className={`inline-flex items-center group cursor-pointer ${className}`}>
          <div className={`${iconSizes[size]} relative rounded-full overflow-hidden flex items-center justify-center bg-white/10 border border-[#1A1A1A]/10 shrink-0 transition-transform duration-300 group-hover:scale-105`}>
            <img
              src={settings.logo_url}
              alt={settings.gallery_name || 'Logo'}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          </div>
        </div>
      );
    }

    return (
      <div className={`inline-flex items-center gap-2.5 group cursor-pointer ${className}`}>
        <div className={`${iconSizes[size]} relative rounded-full overflow-hidden flex items-center justify-center bg-[#FAF9F6] border border-[#1A1A1A]/10 shrink-0 shadow-2xs transition-transform duration-300 group-hover:scale-105`}>
          <img
            src={settings.logo_url}
            alt={settings.gallery_name || 'Logo'}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        </div>

        {variant !== 'icon-only' && (
          <div className="flex flex-col whitespace-nowrap justify-center">
            <span
              className={`font-black tracking-tighter uppercase transition-colors duration-200 ${
                variant === 'light' ? 'text-white' : 'text-[#1A1A1A] group-hover:text-[#EF5A33]'
              } ${textSizes[size]}`}
            >
              {settings.gallery_name || 'KAYOLA'}
            </span>
            <span
              className={`text-[9px] uppercase tracking-[0.25em] font-medium -mt-1 ${
                variant === 'light' ? 'text-white/60' : 'text-[#1A1A1A]/50'
              }`}
            >
              {settings.tagline_fr || 'Art Contemporain'}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Default Monogram SVG Emblem
  return (
    <div className={`inline-flex items-center gap-2.5 group cursor-pointer ${className}`}>
      {/* Coral Badge with stylized 'Y/P/K' Monogram */}
      <div
        className={`${iconSizes[size]} relative rounded-full bg-[#EF5A33] flex items-center justify-center shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-105`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-3/5 h-3/5 text-white fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stylized monogram emblem from reference */}
          <path
            d="M32 40 L44 58 L44 76 C44 78 41 80 37 80 C33 80 30 78 30 76 L30 72 L36 72 L36 58 L24 40 L32 40 Z"
            fill="white"
          />
          <path
            d="M44 58 C52 58 64 56 68 47 C72 38 68 28 58 28 C48 28 42 36 42 46 C42 52 45 56 50 56 C55 56 58 52 58 46 C58 40 54 36 50 36 C47 36 45 38 45 42 L40 42 C40 34 46 30 52 30 C62 30 66 38 62 48 C58 56 48 56 42 56"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {variant !== 'icon-only' && (
        <div className="flex flex-col whitespace-nowrap justify-center">
          <span
            className={`font-black tracking-tighter uppercase transition-colors duration-200 ${
              variant === 'light' ? 'text-white' : 'text-[#1A1A1A] group-hover:text-[#EF5A33]'
            } ${textSizes[size]}`}
          >
            {settings.gallery_name || 'KAYOLA'}
          </span>
          <span
            className={`text-[9px] uppercase tracking-[0.25em] font-medium -mt-1 ${
              variant === 'light' ? 'text-white/60' : 'text-[#1A1A1A]/50'
            }`}
          >
            {settings.tagline_fr || 'Art Contemporain'}
          </span>
        </div>
      )}
    </div>
  );
};

