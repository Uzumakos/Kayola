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
              <h1 className="font-serif italic text-4xl sm:text-5xl lg:text-7xl font-normal tracking-tight leading-[1.08] text-white">
                <span className="block">{t.hero.titleLine1 || 'KAYOLA / Art'}</span>
                <span className="block text-[#EF5A33]">{t.hero.titleLine2 || 'for Social Impact'}</span>
              </h1>

              <div className="space-y-4">
                <p className="text-xl sm:text-2xl text-[#EF5A33] font-serif italic">
                  {t.hero.subtitle || 'Art that gives back.'}
                </p>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">
                  {t.hero.hook || 'Créer. Donner. Impact.'}
                </p>
                <p className="text-base sm:text-lg text-white/70 max-w-xl font-normal leading-relaxed mx-auto lg:mx-0 font-sans">
                  {t.hero.description || 'Chaque œuvre est une histoire. Chaque achat contribue à faire une différence.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => navigate(`/${locale}/gallery`)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#EF5A33] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#D94725] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>{t.hero.exploreBtn || 'Découvrir la collection →'}</span>
                </button>
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

      {/* 2. COMMERCIAL CORE SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-10">
        <h2 className="font-serif italic text-3xl sm:text-5xl font-normal text-[#1A1A1A]">
          {t.commercialCore?.title || 'ACHETE UNE ŒUVRE. CONTRIBUE À UNE CAUSE.'}
        </h2>
        <p className="text-lg sm:text-xl text-[#1A1A1A]/70 leading-relaxed font-sans max-w-3xl mx-auto">
          {t.commercialCore?.paragraph || "KayOla est un projet d'art social qui utilise la créativité pour contribuer à la vie des autres. Quand vous achetez une œuvre, vous ne ramenez pas seulement une pièce d'art chez vous. Vous participez à une cause sociale qui dépasse l'œuvre."}
        </p>
      </section>

      {/* 3. MISSION & PERSONAL STORY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 mt-10">
        <div className="bg-[#FAF9F6] rounded-3xl p-8 sm:p-16 lg:p-20 border border-[#1A1A1A]/10 shadow-sm relative overflow-hidden">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Compass className="w-64 h-64 text-[#1A1A1A]" />
            </div>
            
            <div className="relative z-10 max-w-3xl mx-auto space-y-10">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#EF5A33] text-center">
                {t.mission?.title || 'POURQUOI KAYOLA EXISTE ?'}
              </h2>
              
              <div className="relative">
                <div className="absolute -left-6 sm:-left-12 top-0 text-6xl text-[#EF5A33]/20 font-serif leading-none">"</div>
                <p className="text-lg sm:text-2xl text-[#1A1A1A] font-serif italic leading-relaxed">
                  {t.mission?.storytelling || "Pendant toutes mes années scolaires et universitaires, j’ai eu la chance de recevoir des bourses d’excellence qui m’ont permis de poursuivre mes études sans que les frais de scolarité deviennent un obstacle. Je sais ce que cela signifie de pouvoir continuer à apprendre parce que quelqu’un, quelque part, a choisi d’investir en vous. Aujourd’hui, je veux à mon tour redonner une partie de ce que j’ai reçu."}
                </p>
              </div>

              <div className="space-y-4 pt-8 border-t border-[#1A1A1A]/10 text-center">
                <p className="text-base sm:text-lg font-bold text-[#1A1A1A]">
                  {t.mission?.mantra || "KayOla est né de cette conviction : utiliser ce que je sais créer pour contribuer à offrir des opportunités à d’autres. Je crée. Vous achetez. Ensemble, nous donnons."}
                </p>
                <p className="text-sm font-serif italic text-[#1A1A1A]/60">
                  {t.mission?.closing || "I am giving back to life what I received."}
                </p>
              </div>
            </div>
        </div>
      </section>

      {/* 4. FIRST COLLECTION & SCARCITY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 mt-20">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 space-y-6">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#EF5A33]">
                  Première Collection
                </span>
                <h2 className="font-serif italic text-4xl sm:text-6xl font-normal text-[#1A1A1A] leading-tight">
                  {t.collectionHighlights?.name || "LES SAISONS D’UNE VIE"}
                </h2>
                <p className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A]/80 bg-[#1A1A1A]/5 inline-block px-4 py-2 rounded-lg">
                  {t.collectionHighlights?.scarcity || "10 ŒUVRES. UNE COLLECTION UNIQUE. Chaque œuvre appartient à une collection limitée de 10 pièces. Une fois vendue, elle ne sera plus disponible. Choisissez celle qui raconte quelque chose de votre propre histoire."}
                </p>
                <p className="text-lg text-[#1A1A1A]/70 leading-relaxed">
                  {t.collectionHighlights?.poeticDesc || "10 tableaux. 10 moments. Une seule vie. Une collection qui nous invite à nous rappeler ce qui est vraiment important : vivre, aimer, pardonner. Parce que nous ne savons jamais quand le fil de la vie peut se briser."}
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => navigate(`/${locale}/gallery`)}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1A1A1A] hover:text-[#EF5A33] transition-colors border-b border-[#1A1A1A] pb-0.5"
                  >
                    <span>Découvrir la collection complète</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
            </div>
            
            <div className="flex-1 w-full relative">
                <div className="aspect-square sm:aspect-4/3 rounded-2xl overflow-hidden bg-[#222222] relative group shadow-xl border border-[#1A1A1A]/10">
                  {artworks[0] ? (
                      <img 
                        src={artworks[0].images[0]?.url} 
                        alt="Collection Art" 
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                      />
                  ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] flex items-center justify-center text-white/20">
                          <Compass className="w-16 h-16" />
                      </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-xl border border-white/20 text-white font-serif italic text-2xl shadow-2xl">
                        10/10
                      </div>
                  </div>
                </div>
            </div>
          </div>
      </section>

      {/* 5. VISUAL IMPACT SECTION */}
      <section className="bg-[#1A1A1A] py-20 mt-20 text-white border-y border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center">
            <h2 className="font-serif italic text-3xl sm:text-5xl font-normal text-white max-w-3xl mx-auto">
              {t.visualImpact?.title || "VOTRE ACHAT FAIT PLUS QUE VOUS APPARTENIR À UNE ŒUVRE."}
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8 relative">
              {/* Desktop connecting line */}
              <div className="hidden sm:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-1/2" />
              
              {/* Step 1 */}
              <div className="relative flex flex-col items-center text-center space-y-4 w-full sm:w-1/4 z-10 group">
                <div className="w-16 h-16 rounded-2xl bg-[#2A2A2A] border border-white/10 flex items-center justify-center text-white group-hover:bg-[#EF5A33] group-hover:border-[#EF5A33] group-hover:-translate-y-1 transition-all duration-300">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold uppercase tracking-wider text-white">
                  {t.visualImpact?.step1 || "1 œuvre achetée"}
                </p>
              </div>
              
              {/* Mobile arrow */}
              <div className="sm:hidden text-white/30">↓</div>

              {/* Step 2 */}
              <div className="relative flex flex-col items-center text-center space-y-4 w-full sm:w-1/4 z-10 group">
                <div className="w-16 h-16 rounded-2xl bg-[#2A2A2A] border border-white/10 flex items-center justify-center text-white group-hover:bg-[#EF5A33] group-hover:border-[#EF5A33] group-hover:-translate-y-1 transition-all duration-300">
                    <ArrowRight className="w-8 h-8 rotate-90 sm:rotate-0" />
                </div>
                <p className="text-sm font-bold uppercase tracking-wider text-white">
                  {t.visualImpact?.step2 || "Une partie reversée à une initiative sociale"}
                </p>
              </div>
              
              {/* Mobile arrow */}
              <div className="sm:hidden text-white/30">↓</div>

              {/* Step 3 */}
              <div className="relative flex flex-col items-center text-center space-y-4 w-full sm:w-1/4 z-10 group">
                <div className="w-16 h-16 rounded-2xl bg-[#2A2A2A] border border-white/10 flex items-center justify-center text-white group-hover:bg-[#EF5A33] group-hover:border-[#EF5A33] group-hover:-translate-y-1 transition-all duration-300">
                    <Award className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold uppercase tracking-wider text-white">
                  {t.visualImpact?.step3 || "Des ressources pour une cause sociale"}
                </p>
              </div>
              
              {/* Mobile arrow */}
              <div className="sm:hidden text-white/30">↓</div>

              {/* Step 4 */}
              <div className="relative flex flex-col items-center text-center space-y-4 w-full sm:w-1/4 z-10 group">
                <div className="w-16 h-16 rounded-2xl bg-[#2A2A2A] border border-white/10 flex items-center justify-center text-white group-hover:bg-[#EF5A33] group-hover:border-[#EF5A33] group-hover:-translate-y-1 transition-all duration-300">
                    <Compass className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold uppercase tracking-wider text-white">
                  {t.visualImpact?.step4 || "Un impact qui continue au-delà de la toile"}
                </p>
              </div>
          </div>

          <div className="flex justify-center pt-8">
              <div className="inline-flex items-center justify-center bg-white text-[#1A1A1A] font-bold text-sm uppercase tracking-widest px-8 py-5 rounded-full shadow-2xl">
                {t.visualImpact?.highlight || "Objectif : contribuer à financer 400 sacs scolaires. 🎒"}
              </div>
          </div>
        </div>
      </section>

      {/* 6. COMMITMENT & TRANSPARENCY SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 mt-20">
        <ShieldCheck className="w-16 h-16 text-[#EF5A33] mx-auto opacity-80" />
        <h2 className="font-serif italic text-3xl sm:text-4xl font-normal text-[#1A1A1A]">
          {t.commitment?.title || "L’ART, MAIS AUSSI LA TRANSPARENCE."}
        </h2>
        <p className="text-base sm:text-lg text-[#1A1A1A]/70 leading-relaxed font-sans">
          {t.commitment?.text || "Nous voulons que chaque achat soit simple, mais aussi que son impact soit clair. Une partie des revenus de cette collection sera consacrée au projet social annoncé par KayOla. À la fin du projet, nous partagerons les résultats et l’impact généré."}
        </p>
      </section>

      {/* CROSS-SECTION BRANDING ELEMENTS / SIGNATURES */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-10 border-t border-[#1A1A1A]/10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/40">
          <span>{t.signatures?.sig1 || "L'art pour servir les autres."}</span>
          <span className="hidden sm:inline">•</span>
          <span>{t.signatures?.sig2 || "Créer. Donner. Impact."}</span>
      </div>
    </div>
  );
};
