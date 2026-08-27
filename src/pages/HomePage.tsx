import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { store } from '../lib/store';
import { Artwork, Category } from '../types';
import { ArtworkCard } from '../components/artwork/ArtworkCard';
import {
  ArrowRight,
  ShieldCheck,
  Compass,
  Award,
  Search,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const HomePage: React.FC = () => {
  const { locale, t, navigate } = useApp();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [featuredArtworks, setFeaturedArtworks] = useState<Artwork[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentArtIndex, setCurrentArtIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const loadedArtworks = store.getArtworks();
    setArtworks(loadedArtworks);
    setFeaturedArtworks(store.getFeaturedArtworks());
    setCategories(store.getCategories());

    const unsubscribe = store.subscribe(() => {
      const updatedArtworks = store.getArtworks();
      setArtworks(updatedArtworks);
      setFeaturedArtworks(store.getFeaturedArtworks());
      setCategories(store.getCategories());
    });
    return unsubscribe;
  }, []);

  // Smooth automatic transition every 3 seconds
  useEffect(() => {
    if (artworks.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentArtIndex((prevIndex) => (prevIndex + 1) % artworks.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [artworks.length, isPaused]);

  const activeArt = artworks.length > 0 ? artworks[currentArtIndex % artworks.length] : null;

  const handlePrevArt = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (artworks.length === 0) return;
    setCurrentArtIndex((prev) => (prev - 1 + artworks.length) % artworks.length);
  };

  const handleNextArt = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (artworks.length === 0) return;
    setCurrentArtIndex((prev) => (prev + 1) % artworks.length);
  };

  return (
    <div className="space-y-20 sm:space-y-28 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#1A1A1A] text-white pt-16 pb-24 sm:pt-24 sm:pb-36">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#EF5A33_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left"
            >
              <h1 className="font-serif italic text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.08]">
                {t.hero.title}
              </h1>

              <p className="text-base sm:text-xl text-white/70 max-w-2xl font-normal leading-relaxed mx-auto lg:mx-0 font-sans">
                {t.hero.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => navigate(`/${locale}/gallery`)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#EF5A33] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#D94725] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>{t.hero.exploreBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate(`/${locale}/order/track`)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-widest border border-white/15 transition-all"
                >
                  <Compass className="w-4 h-4 text-[#EF5A33]" />
                  <span>{t.hero.trackOrderBtn}</span>
                </button>
              </div>

              {/* Assurance mini badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-left">

                <div>
                  <p className="text-xs uppercase font-bold tracking-wider text-white">
                    Règlement Direct
                  </p>
                  <p className="text-[11px] text-white/50">MonCash, NatCash, Virements</p>
                </div>
                <div>
                  <p className="text-xs uppercase font-bold tracking-wider text-white">
                    Livraison Soignée
                  </p>
                  <p className="text-[11px] text-white/50">Protection de transport d'art</p>
                </div>
              </div>
            </motion.div>

            {/* Right Featured Artwork Display with Smooth 3-Second Transition */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Visual Backdrop decoration */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#EF5A33]/20 to-transparent rounded-3xl blur-2xl transform -rotate-2" />

                <div className="relative bg-[#222222] rounded-3xl overflow-hidden border border-white/10 p-5 shadow-2xl">
                  {activeArt ? (
                    <div className="space-y-4">
                      {/* Animated Artwork Canvas & Details */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeArt.id}
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.02 }}
                          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                          className="cursor-pointer group space-y-4"
                          onClick={() => navigate(`/${locale}/artwork/${activeArt.slug}`)}
                        >
                          <div className="relative art-corner-frame aspect-4/3 overflow-hidden rounded-2xl bg-black">
                            <img
                              src={activeArt.images[0]?.url}
                              alt={activeArt.title_fr}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Status badge if not available */}
                            {activeArt.status !== 'AVAILABLE' && (
                              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider text-white border border-white/20">
                                {activeArt.status}
                              </div>
                            )}
                          </div>

                          <div className="flex items-start justify-between pt-1 gap-2">
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-[#EF5A33] uppercase tracking-widest block truncate">
                                PAR {activeArt.artist} • {activeArt.year}
                              </span>
                              <h3 className="font-serif italic text-2xl font-normal text-white group-hover:text-[#EF5A33] transition-colors mt-0.5 truncate">
                                {locale === 'en' ? (activeArt.title_en || activeArt.title_fr) : locale === 'ht' ? (activeArt.title_ht || activeArt.title_fr) : activeArt.title_fr}
                              </h3>
                            </div>
                            <span className="font-serif italic text-xl text-white whitespace-nowrap shrink-0">
                              {activeArt.price.toLocaleString()} {activeArt.currency}
                            </span>
                          </div>
                        </motion.div>
                      </AnimatePresence>

                      {/* Carousel Indicator & Smooth Controls */}
                      {artworks.length > 1 && (
                        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                          {/* Dot Progress Indicators */}
                          <div className="flex items-center gap-1.5 flex-wrap max-w-[220px]">
                            {artworks.slice(0, 8).map((art, idx) => (
                              <button
                                key={art.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentArtIndex(idx);
                                }}
                                className={`h-1.5 rounded-full transition-all duration-500 ${idx === (currentArtIndex % Math.min(artworks.length, 8))
                                    ? 'w-6 bg-[#EF5A33]'
                                    : 'w-1.5 bg-white/20 hover:bg-white/40'
                                  }`}
                                title={art.title_fr}
                              />
                            ))}
                            {artworks.length > 8 && (
                              <span className="text-[10px] text-white/40 font-mono ml-1">
                                +{artworks.length - 8}
                              </span>
                            )}
                          </div>

                          {/* Navigation Buttons */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={handlePrevArt}
                              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                              title="Œuvre précédente"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-[11px] font-mono text-white/50 px-1">
                              {(currentArtIndex % artworks.length) + 1}/{artworks.length}
                            </span>
                            <button
                              onClick={handleNextArt}
                              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                              title="Œuvre suivante"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-4/3 flex items-center justify-center text-white/50 text-xs">
                      Chargement de l’exposition...
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. CURATED FEATURED ARTWORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1A1A1A]/10 pb-6">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#EF5A33]">
              Sélection du Commissaire
            </span>
            <h2 className="font-serif italic text-3xl sm:text-5xl font-normal text-[#1A1A1A]">
              {t.featured.sectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#1A1A1A]/60 max-w-xl">
              {t.featured.sectionSubtitle}
            </p>
          </div>

          <button
            onClick={() => navigate(`/${locale}/gallery`)}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1A1A1A] hover:text-[#EF5A33] transition-colors self-start sm:self-auto border-b border-[#1A1A1A] pb-0.5"
          >
            <span>{t.featured.viewAll}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      </section>

      {/* 3. CATEGORIES & MEDIUMS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[#EF5A33]">
            {t.categories.sectionSubtitle}
          </span>
          <h2 className="font-serif italic text-3xl sm:text-5xl font-normal text-[#1A1A1A]">
            {t.categories.sectionTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const name = locale === 'en' ? cat.name_en : locale === 'ht' ? (cat.name_ht || cat.name_fr) : cat.name_fr;
            const desc = locale === 'en' ? cat.description_en : locale === 'ht' ? (cat.description_ht || cat.description_fr) : cat.description_fr;
            return (
              <div
                key={cat.id}
                onClick={() => navigate(`/${locale}/gallery?category=${cat.id}`)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-[#1A1A1A]/10 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="aspect-4/3 overflow-hidden bg-[#FAF9F6]">
                  <img
                    src={cat.image_url}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-3 bg-[#FAF9F6]/50">
                  <div>
                    <h3 className="font-serif italic font-medium text-xl text-[#1A1A1A] group-hover:text-[#EF5A33] transition-colors">
                      {name}
                    </h3>
                    <p className="text-xs text-[#1A1A1A]/60 mt-1 line-clamp-2">
                      {desc}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] group-hover:text-[#EF5A33]">
                    <span>Découvrir</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. GALLERY COMMITMENTS / TRUST GRID */}
      <section className="bg-white border-y border-[#1A1A1A]/10 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#EF5A33]">
              L'Expérience KAYOLA
            </span>
            <h2 className="font-serif italic text-3xl sm:text-5xl font-normal text-[#1A1A1A]">
              L’Art dans les Règles de l’Art
            </h2>
            <p className="text-xs sm:text-sm text-[#1A1A1A]/60">
              Un processus transparent, rigoureux et hautement sécurisé pour les collectionneurs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#F5F4F0] border border-[#1A1A1A]/10 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#EF5A33]" />
              </div>
              <h3 className="font-serif italic font-medium text-2xl text-[#1A1A1A]">
                Authenticité & Traçabilité
              </h3>
              <p className="text-xs sm:text-sm text-[#1A1A1A]/70 leading-relaxed">
                Chaque œuvre est signée et accompagnée d'un certificat d’authenticité physique délivré par la galerie et l’artiste.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#F5F4F0] border border-[#1A1A1A]/10 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center">
                <Award className="w-6 h-6 text-[#EF5A33]" />
              </div>
              <h3 className="font-serif italic font-medium text-2xl text-[#1A1A1A]">
                Paiement Direct & Vérifié
              </h3>
              <p className="text-xs sm:text-sm text-[#1A1A1A]/70 leading-relaxed">
                Réglez par MonCash, NatCash ou virement bancaire. Notre équipe valide manuellement chaque preuve pour sécuriser votre acquisition.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#F5F4F0] border border-[#1A1A1A]/10 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center">
                <Compass className="w-6 h-6 text-[#EF5A33]" />
              </div>
              <h3 className="font-serif italic font-medium text-2xl text-[#1A1A1A]">
                Suivi Privé en Temps Réel
              </h3>
              <p className="text-xs sm:text-sm text-[#1A1A1A]/70 leading-relaxed">
                Accédez à votre espace collectionneur sans création de compte complexe grâce à votre code d'accès unique.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-[#1A1A1A] text-white p-8 sm:p-16 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#EF5A33]">
              Acquisitions Privées
            </span>
            <h2 className="font-serif italic text-3xl sm:text-5xl font-normal leading-tight">
              Trouvez l’œuvre qui transformera votre espace.
            </h2>
            <p className="text-xs sm:text-sm text-white/70">
              Notre catalogue réunit des peintures, sculptures et photographies rares créées par des artistes d’exception.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => navigate(`/${locale}/gallery`)}
              className="px-8 py-4 rounded-full bg-[#EF5A33] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#D94725] transition-all shadow-lg"
            >
              Parcourir le catalogue
            </button>
            <button
              onClick={() => navigate(`/${locale}/contact`)}
              className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-widest border border-white/15 transition-all"
            >
              Contacter la galerie
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
