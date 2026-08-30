import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Award, Compass, ArrowRight, HeartHandshake, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { store } from '../lib/store';

export const AboutPage: React.FC = () => {
  const { locale, t, navigate } = useApp();
  const settings = store.getSettings();

  const images = settings.about_images && settings.about_images.length > 0
    ? settings.about_images
    : ['https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85'];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [images.length]);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 sm:space-y-24">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#EF5A33]">
          {locale === 'en' ? 'Who is Fabiola?' : 'Qui est Fabiola ?'}
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-[#171717]">
          {t.about.title || 'Qui est Fabiola ?'}
        </h1>
      </div>

      {/* Narrative Section with Slider */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-6 text-[#171717]">
            <p className="text-base sm:text-lg leading-relaxed font-medium">
              {t.about.fabiolaParagraph1 || "Jennyfer Fabiola Franklin est une jeune femme multipotentielle qui refuse de choisir entre ses différentes passions : Médecine, arts visuels, communication, création de contenu, photographie, vidéographie, montage, entrepreneuriat… elle voit ses différentes compétences non pas comme des chemins concurrents, mais comme des outils qui peuvent se rejoindre autour d’une même mission : créer quelque chose qui dépasse sa propre personne."}
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-[#737373] whitespace-pre-line">
              {t.about.fabiolaParagraph2 || "Son parcours lui a aussi appris la valeur de l'opportunité. Ayant bénéficié de bourses durant son parcours scolaire et universitaire, elle porte aujourd'hui une conviction simple :\nCe que nous recevons peut devenir quelque chose que nous redonnons.\nC'est de là que naît KayOla."}
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-[#737373]">
              {t.about.fabiolaParagraph3 || "À travers l'art, Fabiola cherche à créer, raconter et contribuer en transformant progressivement sa créativité en impact social concret."}
            </p>
            <blockquote className="border-l-4 border-[#EF5A33] pl-6 py-2 mt-8 italic text-lg sm:text-xl font-serif text-[#171717]">
              {t.about.fabiolaQuote || "« Je ne veux pas choisir entre ce que j’aime faire. Je veux construire des ponts entre mes talents et leur donner une mission. »"}
            </blockquote>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-[#E8E6E2] relative aspect-4/3 group">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full object-cover"
                alt="Fabiola"
              />
            </AnimatePresence>

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow hover:bg-white text-[#1A1A1A] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow hover:bg-white text-[#1A1A1A] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                        }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 pt-8">
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#171717]">
          {locale === 'en' ? 'Ready to enrich your collection?' : 'Prêt à enrichir votre collection ?'}
        </h3>
        <div>
          <button
            onClick={() => navigate(`/${locale}/gallery`)}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#EF5A33] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#D94725] transition-all shadow-lg"
          >
            <span>{locale === 'en' ? 'Explore the Gallery' : 'Explorer la Galerie'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
