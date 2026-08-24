import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { t, toast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }
    setSubmitted(true);
    toast(t.contact.successMsg, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#EF5A33]">
          Service Conciergerie d'Art
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#171717]">
          {t.contact.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#737373]">
          {t.contact.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-[#E8E6E2] shadow-xs">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#171717]">
                Message Transmis avec Succès
              </h3>
              <p className="text-xs text-[#737373] max-w-sm mx-auto">
                {t.contact.successMsg}
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setSubject('');
                  setMessage('');
                }}
                className="px-6 py-2.5 rounded-full bg-[#171717] text-white text-xs font-semibold"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#171717] block">
                    {t.contact.name} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jean-Marc Duval"
                    className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl text-sm focus:outline-hidden focus:border-[#EF5A33]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#171717] block">
                    {t.contact.email} *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jm.duval@art.com"
                    className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl text-sm focus:outline-hidden focus:border-[#EF5A33]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#171717] block">
                  {t.contact.subject}
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Question sur l'œuvre 'The Blue Horizon'..."
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl text-sm focus:outline-hidden focus:border-[#EF5A33]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#171717] block">
                  {t.contact.message} *
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écrivez votre message ici..."
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl text-sm focus:outline-hidden focus:border-[#EF5A33]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#EF5A33] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#D94725] transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.contact.sendBtn}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Gallery Concierge Info */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-10 rounded-3xl border border-[#E8E6E2] shadow-xs space-y-6">
          <h3 className="font-serif font-bold text-xl text-[#171717] border-b border-[#E8E6E2] pb-3">
            Salon & Coordonnées
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#EF5A33] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#171717] block text-sm">
                  {t.contact.locationTitle}
                </span>
                <p className="text-[#737373] mt-0.5">{t.contact.locationText}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#EF5A33] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#171717] block text-sm">
                  Correspondance E-mail
                </span>
                <a href="mailto:contact@kayola-art.com" className="text-[#EF5A33] font-medium hover:underline">
                  {t.contact.emailText}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#EF5A33] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#171717] block text-sm">
                  Ligne Téléphonique & Concierge
                </span>
                <p className="text-[#737373] mt-0.5">{t.contact.phoneText}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#EF5A33] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#171717] block text-sm">
                  Horaires d'Ouverture
                </span>
                <p className="text-[#737373] mt-0.5">{t.contact.hoursText}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
