import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { store } from '../lib/store';
import { Artwork } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ArtworkCard } from '../components/artwork/ArtworkCard';
import {
  ArrowLeft,
  ShieldCheck,
  Award,
  Frame,
  Calendar,
  Maximize2,
  Share2,
  Check,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { motion } from 'motion/react';

interface ArtworkDetailPageProps {
  slug: string;
}

export const ArtworkDetailPage: React.FC<ArtworkDetailPageProps> = ({ slug }) => {
  const { locale, t, navigate, openLightbox, toast } = useApp();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const art = store.getArtworkBySlug(slug) || store.getArtworkById(slug);
    if (art) {
      setArtwork(art);
      setSelectedImageIndex(0);
    }
  }, [slug]);

  if (!artwork) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#171717]">
          Œuvre introuvable
        </h2>
        <p className="text-sm text-[#737373]">
          L’œuvre demandée n’existe pas ou a été retirée du catalogue.
        </p>
        <button
          onClick={() => navigate(`/${locale}/gallery`)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#171717] text-white text-xs font-semibold"
        >
          {t.artwork.backToGallery}
        </button>
      </div>
    );
  }

  const title = locale === 'en' ? (artwork.title_en || artwork.title_fr) : artwork.title_fr;
  const description = locale === 'en' ? (artwork.description_en || artwork.description_fr) : artwork.description_fr;
  const technique = locale === 'en' ? (artwork.technique_en || artwork.technique_fr) : artwork.technique_fr;
  const materials = locale === 'en' ? (artwork.materials_en || artwork.materials_fr) : artwork.materials_fr;
  const artistBio = locale === 'en' ? (artwork.artist_bio_en || artwork.artist_bio_fr) : artwork.artist_bio_fr;

  const currentImage = artwork.images[selectedImageIndex] || artwork.images[0];
  const isSold = artwork.status === 'SOLD';
  const isReserved = artwork.status === 'RESERVED' || artwork.status === 'PAYMENT_REVIEW';

  const similarArtworks = store
    .getArtworks()
    .filter((a) => a.id !== artwork.id && a.category_id === artwork.category_id)
    .slice(0, 3);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast(t.checkout.copySuccess, 'info');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-16">
      {/* Back button */}
      <button
        onClick={() => navigate(`/${locale}/gallery`)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#737373] hover:text-[#171717] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.artwork.backToGallery}</span>
      </button>

      {/* Main Grid: Left Gallery + Right Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14">
        {/* Left: Gallery & Zoom */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Display Image with Corner Frame Flair */}
          <div className="relative group">
            <div className="absolute -top-3 -left-3 w-20 h-20 border-t-2 border-l-2 border-[#1A1A1A] pointer-events-none z-10" />
            <div className="relative aspect-4/3 sm:aspect-5/4 rounded-2xl overflow-hidden bg-[#E5E4E0] border border-[#1A1A1A]/10 shadow-lg">
              <img
                src={currentImage.url}
                alt={currentImage.alt_text_fr || title}
                className={`w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-102 ${
                  isSold ? 'grayscale contrast-125' : ''
                }`}
                onClick={() => openLightbox(currentImage.url)}
              />

              {/* Top Status */}
              <div className="absolute top-4 left-4 z-20">
                <StatusBadge status={artwork.status} type="artwork" locale={locale} size="md" />
              </div>

              {/* Zoom hint button */}
              <button
                onClick={() => openLightbox(currentImage.url)}
                className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md text-[#1A1A1A] px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-2 hover:bg-white transition-all border border-[#1A1A1A]/10"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#EF5A33]" />
                <span>Agrandir</span>
              </button>
            </div>
          </div>

          {/* Thumbnails strip */}
          {artwork.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {artwork.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative rounded-xl overflow-hidden w-20 h-20 shrink-0 border-2 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-[#1A1A1A] scale-105 shadow-sm'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <p className="text-[11px] text-[#1A1A1A]/50 text-center italic font-serif">
            {t.artwork.zoomInstruction}
          </p>
        </div>

        {/* Right: Artwork Details, Price & Ordering */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8 bg-[#F5F4F0] p-7 sm:p-8 rounded-3xl border border-[#1A1A1A]/10">
          <div className="space-y-6">
            {/* Header / Title */}
            <div className="space-y-2 border-b border-[#1A1A1A]/10 pb-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/60">
                  PAR {artwork.artist} • {artwork.year}
                </span>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/60 hover:text-[#1A1A1A] p-2 rounded-full hover:bg-white transition-colors"
                  title="Partager"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  <span>{copied ? 'Lien copié' : t.artwork.share}</span>
                </button>
              </div>

              <h1 className="font-serif italic text-4xl sm:text-5xl font-normal text-[#1A1A1A] leading-tight">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#1A1A1A]/60 font-medium">
                <span>{artwork.year}</span>
                <span>•</span>
                <span>{t.artwork.uniquePiece}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-[#1A1A1A] font-mono font-bold bg-[#FAF9F6] border border-[#1A1A1A]/15 px-2 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF5A33]" />
                  Réf : {artwork.item_code || artwork.id.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Price Box & Action */}
            <div className="bg-white p-6 rounded-2xl border border-[#1A1A1A]/10 shadow-2xs space-y-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-[#1A1A1A]/40 block">
                    {t.artwork.price}
                  </span>
                  <span className="text-3xl font-serif italic text-[#1A1A1A]">
                    {artwork.price.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')} {artwork.currency}
                  </span>
                </div>
                <StatusBadge status={artwork.status} type="artwork" locale={locale} />
              </div>

              {/* Order Button */}
              {isSold ? (
                <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#1A1A1A]/10 text-center space-y-1">
                  <p className="font-serif italic font-medium text-base text-[#1A1A1A]">
                    {t.artwork.soldNotice}
                  </p>
                  <p className="text-xs text-[#1A1A1A]/60">
                    Cette pièce a été acquise et figure dans les archives de la galerie.
                  </p>
                </div>
              ) : isReserved ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-1">
                    <p className="font-serif italic font-medium text-base text-amber-900">
                      {t.artwork.reservedNotice}
                    </p>
                    <p className="text-xs text-amber-800">
                      Un collectionneur est en cours de validation de paiement.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/${locale}/checkout/${artwork.id}`)}
                    className="w-full py-3.5 rounded-full bg-[#1A1A1A] text-white font-bold text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                  >
                    <span>Tenter l’acquisition (Si la réservation expire)</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/${locale}/checkout/${artwork.id}`)}
                  className="w-full py-4 rounded-full bg-[#1A1A1A] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#EF5A33] transition-all shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5"
                >
                  <span>{t.artwork.orderAction}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <p className="text-[10px] text-[#1A1A1A]/50 text-center font-medium">
                {t.artwork.paymentInfoNote}
              </p>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#1A1A1A]/50">
                {t.artwork.detailsTitle}
              </h3>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#1A1A1A]/10 text-[11px] font-medium uppercase tracking-tight">
                  <dt className="text-[#1A1A1A]/50 text-[9px] font-bold uppercase">{t.artwork.medium}</dt>
                  <dd className="font-bold text-[#1A1A1A] mt-0.5">{technique}</dd>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#1A1A1A]/10 text-[11px] font-medium uppercase tracking-tight">
                  <dt className="text-[#1A1A1A]/50 text-[9px] font-bold uppercase">{t.artwork.materials}</dt>
                  <dd className="font-bold text-[#1A1A1A] mt-0.5">{materials}</dd>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#1A1A1A]/10 text-[11px] font-medium uppercase tracking-tight">
                  <dt className="text-[#1A1A1A]/50 text-[9px] font-bold uppercase">{t.artwork.dimensions}</dt>
                  <dd className="font-bold text-[#1A1A1A] mt-0.5">
                    {artwork.width_cm} × {artwork.height_cm} {artwork.depth_cm ? `× ${artwork.depth_cm}` : ''} cm
                  </dd>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#1A1A1A]/10 text-[11px] font-medium uppercase tracking-tight">
                  <dt className="text-[#1A1A1A]/50 text-[9px] font-bold uppercase">{t.artwork.framing}</dt>
                  <dd className="font-bold text-[#1A1A1A] mt-0.5">
                    {artwork.is_framed ? t.artwork.framedYes : t.artwork.framedNo}
                  </dd>
                </div>
                <div className="col-span-2 p-3 bg-white rounded-xl border border-[#1A1A1A]/10 flex items-center justify-between">
                  <div>
                    <dt className="text-[#1A1A1A]/50 text-[9px] font-bold uppercase">{t.artwork.certificate}</dt>
                    <dd className="font-bold text-[#1A1A1A] mt-0.5">
                      {artwork.has_certificate ? t.artwork.certificateYes : t.artwork.certificateNo}
                    </dd>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-[#EF5A33]" />
                </div>
              </dl>
            </div>

            {/* Story / Description */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#1A1A1A]/50">
                {t.artwork.artworkStory}
              </h3>
              <p className="text-sm text-[#1A1A1A]/80 leading-relaxed font-sans bg-white p-4 rounded-xl border border-[#1A1A1A]/10">
                {description}
              </p>
            </div>

            {/* Artist Bio */}
            {artistBio && (
              <div className="p-5 bg-white rounded-xl border border-[#1A1A1A]/10 space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">
                  {t.artwork.artistBio} — {artwork.artist}
                </h4>
                <p className="text-xs text-[#1A1A1A]/70 leading-relaxed">
                  {artistBio}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Similar Artworks */}
      {similarArtworks.length > 0 && (
        <div className="pt-16 border-t border-[#E8E6E2] space-y-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#171717]">
            {t.artwork.similarArtworks}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarArtworks.map((art) => (
              <ArtworkCard key={art.id} artwork={art} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
