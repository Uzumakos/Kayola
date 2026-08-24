import React from 'react';
import { useApp } from '../../context/AppContext';
import { KayolaLogo } from './KayolaLogo';
import { ShieldCheck, Mail, Phone, MapPin, Compass, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { locale, t, navigate } = useApp();

  return (
    <footer className="bg-[#171717] text-white pt-16 pb-12 border-t border-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div onClick={() => navigate(`/${locale}`)}>
              <KayolaLogo size="lg" variant="light" />
            </div>
            <p className="text-sm text-[#E8E6E2]/70 max-w-sm leading-relaxed font-sans">
              {t.brand.shortDescription}
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-[#E8E6E2]/60">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-[#EF5A33]" />
                Certificat d’Authenticité 100%
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white">
                Paiement Manuel Vérifié
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white/50">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2 text-sm text-[#E8E6E2]/80">
              <li>
                <button
                  onClick={() => navigate(`/${locale}`)}
                  className="hover:text-[#EF5A33] transition-colors flex items-center gap-1"
                >
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate(`/${locale}/gallery`)}
                  className="hover:text-[#EF5A33] transition-colors flex items-center gap-1"
                >
                  {t.nav.gallery}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate(`/${locale}/about`)}
                  className="hover:text-[#EF5A33] transition-colors flex items-center gap-1"
                >
                  {t.nav.about}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate(`/${locale}/contact`)}
                  className="hover:text-[#EF5A33] transition-colors flex items-center gap-1"
                >
                  {t.nav.contact}
                </button>
              </li>
            </ul>
          </div>

          {/* Collector & Tracking */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white/50">
              Collectionneurs
            </h4>
            <ul className="space-y-2 text-sm text-[#E8E6E2]/80">
              <li>
                <button
                  onClick={() => navigate(`/${locale}/order/track`)}
                  className="hover:text-[#EF5A33] transition-colors inline-flex items-center gap-1 text-[#EF5A33] font-medium"
                >
                  <Compass className="w-3.5 h-3.5" />
                  {t.nav.trackOrder}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/admin')}
                  className="hover:text-[#EF5A33] transition-colors flex items-center gap-1 text-white/50 hover:text-white"
                >
                  {t.nav.admin}
                </button>
              </li>
              <li className="text-xs text-white/40 pt-2">
                MonCash • NatCash • Virement Bancaire Sogebank & Unibank • SWIFT
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white/50">
              {t.footer.contactInfo}
            </h4>
            <div className="space-y-2 text-xs text-[#E8E6E2]/80">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#EF5A33] shrink-0 mt-0.5" />
                <span>KAYOLA Space, Port-au-Prince & Global Concierge</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#EF5A33] shrink-0" />
                <a href="mailto:contact@kayola-art.com" className="hover:text-[#EF5A33]">
                  contact@kayola-art.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#EF5A33] shrink-0" />
                <span>+509 3800-0000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#E8E6E2]/50 gap-4">
          <p>{t.footer.copyright}</p>
          <p className="text-center sm:text-right">{t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
};
