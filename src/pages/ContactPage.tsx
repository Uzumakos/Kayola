import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { syncContactMessageToSupabase } from '../lib/supabase';

export const ContactPage: React.FC = () => {
  const { t, toast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  // Security & Bot Prevention States
  const [botField, setBotField] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: number;
    if (cooldown > 0) {
      timer = window.setTimeout(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Rate Limiting Check
    if (cooldown > 0) {
      toast(`Veuillez patienter ${cooldown} secondes avant de renvoyer un message.`, 'error');
      return;
    }

    // 2. Honeypot Check (Bot Prevention)
    if (botField) {
      // Silently reject if bot field is filled, but pretend to succeed
      setSubmitted(true);
      return;
    }

    // 3. Validation
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast('Veuillez entrer une adresse e-mail valide.', 'error');
      return;
    }

    if (message.length < 10) {
      toast('Votre message est trop court.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    // 4. Send to Supabase
    const { success, error } = await syncContactMessageToSupabase({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'unread'
    });

    setIsSubmitting(false);

    if (success) {
      setSubmitted(true);
      setCooldown(60); // 60 seconds cooldown
      toast(t.contact.successMsg || 'Message envoyé avec succès.', 'success');
    } else {
      toast('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.', 'error');
      console.error('Contact Form Error:', error);
    }
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
            <form onSubmit={handleSubmit} className="space-y-4 relative">
              {/* HONEYPOT FIELD - INVISIBLE TO HUMANS */}
              <div className="absolute opacity-0 -z-10 w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
                <label htmlFor="company_website">Site Web (Ne pas remplir)</label>
                <input
                  type="text"
                  id="company_website"
                  name="company_website"
                  autoComplete="off"
                  tabIndex={-1}
                  value={botField}
                  onChange={(e) => setBotField(e.target.value)}
                />
              </div>
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
                  disabled={isSubmitting || cooldown > 0}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#EF5A33] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#D94725] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>
                    {isSubmitting 
                      ? 'Envoi en cours...' 
                      : cooldown > 0 
                        ? `Patientez ${cooldown}s` 
                        : t.contact.sendBtn}
                  </span>
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
