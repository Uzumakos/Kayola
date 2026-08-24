import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Award, Compass, ArrowRight, HeartHandshake } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { locale, t, navigate } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 sm:space-y-24">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#EF5A33]">
          Maison d’Art & Galerie
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-[#171717]">
          {t.about.title}
        </h1>
        <p className="text-base sm:text-lg text-[#737373] leading-relaxed">
          {t.about.subtitle}
        </p>
      </div>

      {/* Narrative Section 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#171717]">
            {t.about.missionTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#737373] leading-relaxed">
            {t.about.missionText}
          </p>
          <p className="text-sm text-[#737373] leading-relaxed">
            Dans un monde dominé par la reproduction numérique éphémère, KAYOLA se positionne comme un écrin pour l'art tangible, les textures réelles, les pigments vibrants et l'expression brute de l'esprit humain.
          </p>
        </div>

        <div className="lg:col-span-6">
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-[#E8E6E2]">
            <img
              src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85"
              alt="KAYOLA Art Space"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>

      {/* Commitments & Values */}
      <div className="bg-white p-8 sm:p-14 rounded-3xl border border-[#E8E6E2] shadow-xs space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-serif text-3xl font-bold text-[#171717]">
            {t.about.valuesTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#737373]">
            Les standards d'excellence qui régissent chaque interaction et acquisition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.about.values.map((v, i) => (
            <div key={i} className="p-6 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E2] space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#EF5A33]/10 text-[#EF5A33] flex items-center justify-center">
                {i === 0 ? <ShieldCheck className="w-5 h-5" /> : i === 1 ? <HeartHandshake className="w-5 h-5" /> : <Compass className="w-5 h-5" />}
              </div>
              <h3 className="font-serif font-bold text-lg text-[#171717]">{v.title}</h3>
              <p className="text-xs text-[#737373] leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4">
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#171717]">
          Prêt à enrichir votre collection ?
        </h3>
        <div>
          <button
            onClick={() => navigate(`/${locale}/gallery`)}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#EF5A33] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#D94725] transition-all shadow-lg"
          >
            <span>Explorer la Galerie</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
