import React from 'react';
import { ArtworkStatus, OrderStatus, Locale } from '../../types';
import { translations } from '../../i18n/translations';

interface StatusBadgeProps {
  status: ArtworkStatus | OrderStatus;
  type?: 'artwork' | 'order';
  locale?: Locale;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'artwork',
  locale = 'fr',
  size = 'md',
}) => {
  const t = translations[locale];

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[9px]' : 'px-3 py-1 text-[10px]';

  if (type === 'artwork') {
    switch (status as ArtworkStatus) {
      case 'AVAILABLE':
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300/60 shadow-2xs ${sizeClasses}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t.gallery.statusAvailable}
          </span>
        );
      case 'RESERVED':
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full bg-amber-50 text-amber-900 border border-amber-300/60 shadow-2xs ${sizeClasses}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {t.gallery.statusReserved}
          </span>
        );
      case 'PAYMENT_REVIEW':
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full bg-blue-50 text-blue-900 border border-blue-300/60 shadow-2xs ${sizeClasses}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            {t.gallery.statusReview}
          </span>
        );
      case 'SOLD':
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full bg-[#1A1A1A] text-white border border-[#1A1A1A] shadow-2xs ${sizeClasses}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF5A33]" />
            {t.gallery.statusSold}
          </span>
        );
      default:
        return null;
    }
  }

  // Order status
  const orderLabels = t.tracking.statusLabels;

  switch (status as OrderStatus) {
    case 'PENDING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full bg-amber-50 text-amber-900 border border-amber-300/60 shadow-2xs ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          {orderLabels.PENDING}
        </span>
      );
    case 'PAYMENT_PROOF_SUBMITTED':
    case 'PAYMENT_REVIEW':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full bg-blue-50 text-blue-900 border border-blue-300/60 shadow-2xs ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          {orderLabels.PAYMENT_REVIEW}
        </span>
      );
    case 'PAYMENT_ACCEPTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300/60 shadow-2xs ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {orderLabels.PAYMENT_ACCEPTED}
        </span>
      );
    case 'PAYMENT_REJECTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full bg-rose-50 text-rose-900 border border-rose-300/60 shadow-2xs ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          {orderLabels.PAYMENT_REJECTED}
        </span>
      );
    case 'SOLD':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full bg-[#1A1A1A] text-white border border-[#1A1A1A] shadow-2xs ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF5A33]" />
          {orderLabels.SOLD}
        </span>
      );
    case 'CANCELLED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full bg-gray-100 text-gray-800 border border-gray-300/60 ${sizeClasses}`}
        >
          {orderLabels.CANCELLED}
        </span>
      );
    default:
      return null;
  }
};
