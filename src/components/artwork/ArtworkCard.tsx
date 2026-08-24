import React from 'react';
import { Artwork } from '../../types';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../ui/StatusBadge';
import { Eye, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface ArtworkCardProps {
  artwork: Artwork;
  priority?: boolean;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork, priority = false }) => {
  const { locale, t, navigate, openLightbox } = useApp();

  const title = locale === 'en' ? (artwork.title_en || artwork.title_fr) : artwork.title_fr;
  const technique = locale === 'en' ? (artwork.technique_en || artwork.technique_fr) : artwork.technique_fr;

  const primaryImage =
    artwork.images.find((img) => img.is_primary)?.url ||
    artwork.images[0]?.url ||
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80';

  const isSold = artwork.status === 'SOLD';

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#1A1A1A]/10 shadow-xs hover:shadow-xl hover:border-[#1A1A1A]/30 transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 overflow-hidden bg-[#E5E4E0] cursor-pointer">
        <img
          src={primaryImage}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
            isSold ? 'grayscale contrast-125' : ''
          }`}
          loading={priority ? 'eager' : 'lazy'}
          onClick={() => navigate(`/${locale}/gallery/${artwork.slug}`)}
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <StatusBadge status={artwork.status} type="artwork" locale={locale} size="sm" />

          {artwork.has_certificate && (
            <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-xs text-[#1A1A1A] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs border border-[#1A1A1A]/10">
              <ShieldCheck className="w-3 h-3 text-[#EF5A33]" />
              Certifié
            </span>
          )}
        </div>

        {/* Quick View Lightbox trigger on Hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4 pointer-events-none">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openLightbox(primaryImage);
            }}
            className="pointer-events-auto p-3 bg-white text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            title="Inspecter en haute définition"
            aria-label="Inspecter en haute définition"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60">
              PAR {artwork.artist} • {artwork.year}
            </span>
            {artwork.item_code && (
              <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-[#FAF9F6] border border-[#1A1A1A]/10 text-[#1A1A1A]">
                {artwork.item_code}
              </span>
            )}
          </div>

          <h3
            onClick={() => navigate(`/${locale}/gallery/${artwork.slug}`)}
            className="font-serif italic text-xl font-normal text-[#1A1A1A] group-hover:text-[#EF5A33] transition-colors line-clamp-1 cursor-pointer"
          >
            {title}
          </h3>

          <p className="text-xs text-[#1A1A1A]/60 line-clamp-1 font-medium">
            {technique} • {artwork.width_cm} × {artwork.height_cm} cm
          </p>
        </div>

        {/* Price & CTA */}
        <div className="pt-4 border-t border-[#1A1A1A]/10 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-bold tracking-widest text-[#1A1A1A]/40 block">
              {t.artwork.price}
            </span>
            <span className="text-lg font-serif italic font-medium text-[#1A1A1A]">
              {artwork.price.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')} {artwork.currency}
            </span>
          </div>

          {isSold ? (
            <button
              onClick={() => navigate(`/${locale}/gallery/${artwork.slug}`)}
              className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F0EFEC] text-[#1A1A1A]/60 hover:bg-[#1A1A1A] hover:text-white transition-colors"
            >
              {t.gallery.viewDetails}
            </button>
          ) : (
            <button
              onClick={() => navigate(`/${locale}/checkout/${artwork.id}`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1A1A1A] text-white hover:bg-[#EF5A33] transition-all shadow-xs"
            >
              <span>{t.gallery.buyNow}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
};
