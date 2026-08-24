import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { store } from '../lib/store';
import { isSupabaseConfigured, GeneratedCredentials } from '../lib/supabase';
import { Artwork, PaymentMethod, Order } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Check,
  Copy,
  Upload,
  FileText,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Clock,
  Compass,
  Printer,
  ChevronRight,
  Sparkles,
  CreditCard,
  Barcode,
  Hash,
  Key,
  Lock,
  BookmarkCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CheckoutPageProps {
  artworkId: string;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ artworkId }) => {
  const { locale, t, navigate, toast } = useApp();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Steps: 1: Info, 2: Payment Method, 3: Instructions & Proof Upload, 4: Confirmed Order
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Haïti');
  const [notes, setNotes] = useState('');

  // Selected Payment Method
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');

  // Pre-allocated Order & Access Code Credentials
  const [assignedCredentials, setAssignedCredentials] = useState<GeneratedCredentials | null>(null);

  // Proof File
  const [proofFile, setProofFile] = useState<{
    name: string;
    type: string;
    size: number;
    dataUrl: string;
  } | null>(null);

  // Confirmed Order Result
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const art = store.getArtworkById(artworkId) || store.getArtworkBySlug(artworkId);
    if (art) {
      setArtwork(art);
      if (!assignedCredentials) {
        const creds = store.generateCredentialsForCheckout(art.item_code || 'ART-2026');
        setAssignedCredentials(creds);
      }
    }
    const methods = store.getPaymentMethods(true);
    setPaymentMethods(methods);
    if (methods.length > 0) {
      setSelectedMethodId(methods[0].id);
    }
  }, [artworkId]);

  if (!artwork) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#171717]">
          {t.checkout.artworkUnavailable}
        </h2>
        <button
          onClick={() => navigate(`/${locale}/gallery`)}
          className="px-6 py-3 rounded-full bg-[#171717] text-white text-xs font-semibold"
        >
          {t.artwork.backToGallery}
        </button>
      </div>
    );
  }

  const selectedMethod = paymentMethods.find((p) => p.id === selectedMethodId) || paymentMethods[0];

  const handleCopy = (text: string, fieldId: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      toast(t.checkout.copySuccess || 'Copié dans le presse-papier !', 'info');
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const handleCopyAllSummary = () => {
    if (!assignedCredentials || !selectedMethod) return;
    const summaryText = `--- GALERIE KAYOLA | INSTRUCTIONS DE COMMANDE ---
Code d'accès secret : ${assignedCredentials.accessCode}
Numéro de commande / Réf : ${assignedCredentials.orderNumber}
Code Article SKU : ${artwork.item_code || 'ART-2026-001'}
Œuvre : ${artwork.title_fr} (${artwork.price.toLocaleString()} ${artwork.currency})

Bénéficiaire : ${selectedMethod.account_name}
Numéro / Tél : ${selectedMethod.account_number}
Méthode : ${selectedMethod.name}
Instructions : Indiquez "${assignedCredentials.orderNumber}" comme motif de virement.`;

    handleCopy(summaryText, 'all_summary');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast('Le fichier est trop lourd (max 10 Mo)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProofFile({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !address || !city) {
      toast('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = () => {
    if (!selectedMethodId) {
      toast('Veuillez sélectionner un moyen de paiement.', 'error');
      return;
    }
    setStep(3);
  };

  const handleFinalOrderSubmit = (withImmediateProof = true) => {
    if (withImmediateProof && !proofFile) {
      toast('Veuillez téléverser une preuve de paiement (reçu / capture) ou choisissez d\'ajouter plus tard.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = store.createGuestOrder({
        artworkId: artwork.id,
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        country,
        notes,
        paymentMethodId: selectedMethod.id,
        proofFile: withImmediateProof && proofFile ? proofFile : undefined,
        orderNumber: assignedCredentials?.orderNumber,
        accessCode: assignedCredentials?.accessCode,
      });

      if (result.success && result.order) {
        setConfirmedOrder(result.order);
        setStep(4);

        // Fire celebration confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#EF5A33', '#171717', '#FAF9F6', '#D94725'],
        });

        toast(t.confirmation.title, 'success');
      } else {
        toast(result.error || t.checkout.orderError, 'error');
      }
    } catch {
      toast(t.checkout.orderError, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const artworkTitle = locale === 'en' ? (artwork.title_en || artwork.title_fr) : artwork.title_fr;


  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Title & Guest notice */}
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-[#EF5A33]">
          Acquisition Privée & Sécurisée
        </span>
        <h1 className="font-serif italic text-3xl sm:text-5xl font-normal text-[#1A1A1A]">
          {step === 4 ? t.confirmation.title : t.checkout.pageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#1A1A1A]/60">
          {step === 4 ? t.confirmation.subtitle : t.checkout.guestNotice}
        </p>
      </div>

      {/* Stepper Progress Indicator (when not confirmed) */}
      {step !== 4 && (
        <div className="flex items-center justify-center max-w-xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-4 text-xs font-bold uppercase tracking-wider">
            <div
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full ${
                step >= 1 ? 'bg-[#1A1A1A] text-white' : 'bg-[#FAF9F6] text-[#1A1A1A]/40 border border-[#1A1A1A]/10'
              }`}
            >
              <span>1</span>
              <span className="hidden sm:inline">Coordonnées</span>
            </div>
            <span className="text-[#1A1A1A]/20">—</span>
            <div
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full ${
                step >= 2 ? 'bg-[#1A1A1A] text-white' : 'bg-[#FAF9F6] text-[#1A1A1A]/40 border border-[#1A1A1A]/10'
              }`}
            >
              <span>2</span>
              <span className="hidden sm:inline">Paiement</span>
            </div>
            <span className="text-[#1A1A1A]/20">—</span>
            <div
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full ${
                step >= 3 ? 'bg-[#1A1A1A] text-white' : 'bg-[#FAF9F6] text-[#1A1A1A]/40 border border-[#1A1A1A]/10'
              }`}
            >
              <span>3</span>
              <span className="hidden sm:inline">Preuve</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Body */}
      {step === 4 && confirmedOrder ? (
        /* STEP 4: ORDER CONFIRMATION WITH ACCESS CODE & ARTICLE CODE */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E6E2] shadow-xl max-w-3xl mx-auto space-y-8"
        >
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-2xs">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#171717]">
              {t.confirmation.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#737373] max-w-lg mx-auto leading-relaxed">
              Votre commande a été enregistrée avec succès. Vous pouvez à tout moment vous rendre dans <strong>Suivre ma commande</strong> pour vérifier l'avancement ou ajouter/mettre à jour votre preuve de paiement.
            </p>
          </div>

          {/* Credentials Card (Access Code, Article Code & Order Number) */}
          <div className="bg-[#FAF9F6] p-6 sm:p-7 rounded-2xl border-2 border-[#EF5A33]/30 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8E6E2] pb-3">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-[#737373] flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#EF5A33]" />
                  <span>{t.confirmation.orderNumberLabel}</span>
                </span>
                <span className="text-[10px] text-[#737373]">Identifiant unique de votre transaction</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base sm:text-lg font-bold text-[#171717] select-all bg-white px-3 py-1 rounded-lg border border-[#E8E6E2]">
                  {confirmedOrder.order_number}
                </span>
                <button
                  onClick={() => handleCopy(confirmedOrder.order_number, 'order_num')}
                  className="p-2 text-[#737373] hover:text-[#EF5A33] bg-white rounded-lg border border-[#E8E6E2]"
                  title="Copier le numéro de commande"
                >
                  {copiedField === 'order_num' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Code de l'article */}
            <div className="flex items-center justify-between border-b border-[#E8E6E2] pb-3">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-[#737373] flex items-center gap-1.5">
                  <Barcode className="w-3.5 h-3.5 text-[#EF5A33]" />
                  <span>Code de l'article (Réf. SKU)</span>
                </span>
                <span className="text-[10px] text-[#737373]">Référence officielle de l'œuvre d'art</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm sm:text-base font-extrabold text-[#171717] select-all bg-white px-3 py-1 rounded-lg border border-[#E8E6E2]">
                  {confirmedOrder.artwork?.item_code || artwork.item_code || 'ART-2026-001'}
                </span>
                <button
                  onClick={() => handleCopy(confirmedOrder.artwork?.item_code || artwork.item_code || 'ART-2026-001', 'item_code')}
                  className="p-2 text-[#737373] hover:text-[#EF5A33] bg-white rounded-lg border border-[#E8E6E2]"
                  title="Copier le code de l'article"
                >
                  {copiedField === 'item_code' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Code d'accès */}
            <div className="flex items-center justify-between border-b border-[#E8E6E2] pb-3">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-[#EF5A33] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.confirmation.accessCodeLabel}</span>
                </span>
                <span className="text-[10px] text-[#737373]">
                  Code secret requis pour accéder à votre commande sur la page de suivi
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg sm:text-xl font-black text-[#EF5A33] tracking-widest bg-white px-3.5 py-1.5 rounded-lg border border-[#EF5A33]/40 select-all shadow-xs">
                  {confirmedOrder.access_code}
                </span>
                <button
                  onClick={() => handleCopy(confirmedOrder.access_code, 'access_code')}
                  className="p-2 text-[#737373] hover:text-[#EF5A33] bg-white rounded-lg border border-[#E8E6E2]"
                  title="Copier le code d'accès"
                >
                  {copiedField === 'access_code' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#737373]">
                Œuvre acquise
              </span>
              <span className="font-semibold text-[#171717]">
                {artworkTitle} • {artwork.price.toLocaleString()} {artwork.currency}
              </span>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Conservez vos codes :</strong> Utilisez votre <strong>Code d'accès ({confirmedOrder.access_code})</strong> et votre <strong>Code d'article ({confirmedOrder.artwork?.item_code || artwork.item_code})</strong> ou Numéro de commande pour accéder à l'espace de suivi et ajouter votre preuve de paiement.
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => navigate(`/${locale}/order/track/${confirmedOrder.tracking_token}`)}
              className="w-full sm:flex-1 py-4 rounded-full bg-[#EF5A33] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#D94725] transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Compass className="w-4 h-4" />
              <span>Suivre ma commande & Ajouter ma preuve</span>
            </button>

            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-4 rounded-full bg-white text-[#171717] font-semibold text-xs uppercase tracking-wider border border-[#E8E6E2] hover:bg-[#FAF9F6] transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4 text-[#737373]" />
              <span>{t.confirmation.printReceiptBtn}</span>
            </button>
          </div>
        </motion.div>
      ) : (
        /* STEPS 1-3 FLOW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Main Step Content */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E6E2] shadow-xs space-y-6">
            {/* STEP 1: CUSTOMER INFO */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-6">
                <div className="border-b border-[#E8E6E2] pb-4">
                  <h3 className="font-serif font-bold text-xl text-[#171717]">
                    {t.checkout.step2}
                  </h3>
                  <p className="text-xs text-[#737373] mt-1">
                    {t.checkout.customerInfo}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#171717] block">
                      {t.checkout.firstName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ex: Jean"
                      className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl text-sm focus:outline-hidden focus:border-[#EF5A33]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#171717] block">
                      {t.checkout.lastName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ex: Duval"
                      className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl text-sm focus:outline-hidden focus:border-[#EF5A33]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#171717] block">
                      {t.checkout.email} *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre.email@domaine.com"
                      className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl text-sm focus:outline-hidden focus:border-[#EF5A33]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#171717] block">
                      {t.checkout.phone} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+509 XXXX-XXXX"
                      className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl text-sm focus:outline-hidden focus:border-[#EF5A33]"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-[#171717] block">
                      {t.checkout.address} *
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Numéro et nom de rue, quartier"
                      className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl text-sm focus:outline-hidden focus:border-[#EF5A33]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#171717] block">
                      {t.checkout.city} *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: Port-au-Prince"
                      className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl text-sm focus:outline-hidden focus:border-[#EF5A33]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#171717] block">
                      {t.checkout.country} *
                    </label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Ex: Haïti / France / USA"
                      className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl text-sm focus:outline-hidden focus:border-[#EF5A33]"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-[#171717] block">
                      {t.checkout.notes}
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Instructions spécifiques pour la livraison ou la remise..."
                      className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl text-sm focus:outline-hidden focus:border-[#EF5A33]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 rounded-full bg-[#EF5A33] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#D94725] transition-all shadow-md"
                  >
                    <span>{t.checkout.proceedToPayment}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: SELECT PAYMENT METHOD */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="border-b border-[#E8E6E2] pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-[#171717]">
                      {t.checkout.step3}
                    </h3>
                    <p className="text-xs text-[#737373] mt-1">
                      {t.checkout.selectPaymentMethod}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-[#737373] hover:text-[#171717] flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Retour</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const isSelected = selectedMethodId === method.id;
                    const desc = locale === 'en' ? method.description_en : method.description_fr;
                    return (
                      <label
                        key={method.id}
                        className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#EF5A33] bg-[#EF5A33]/5 shadow-xs'
                            : 'border-[#E8E6E2] hover:border-[#737373]/30 bg-[#FAF9F6]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          checked={isSelected}
                          onChange={() => setSelectedMethodId(method.id)}
                          className="mt-0.5 text-[#EF5A33] focus:ring-[#EF5A33]"
                        />

                        {/* Payment Method Logo or Icon */}
                        <div className="w-12 h-12 rounded-xl bg-white border border-[#E8E6E2] overflow-hidden flex items-center justify-center p-1 shrink-0 shadow-2xs">
                          {method.logo_url ? (
                            <img
                              src={method.logo_url}
                              alt={method.name}
                              className="w-full h-full object-contain rounded-lg"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <CreditCard className="w-5 h-5 text-[#EF5A33]" />
                          )}
                        </div>

                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-serif font-bold text-base text-[#171717]">
                              {method.name}
                            </p>
                          </div>
                          {desc && <p className="text-xs text-[#737373] truncate">{desc}</p>}
                          <p className="text-[11px] font-mono text-[#171717]/80 pt-0.5">
                            Bénéficiaire : <strong>{method.account_name}</strong>
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full sm:w-auto text-center py-3 px-5 rounded-full text-xs font-semibold text-[#737373] hover:text-[#171717] hover:bg-[#FAF9F6] transition-colors"
                  >
                    ← Modifier coordonnées
                  </button>

                  <button
                    type="button"
                    onClick={handleStep2Submit}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 sm:px-7 sm:py-3.5 rounded-full bg-[#EF5A33] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#D94725] transition-all shadow-md text-center"
                  >
                    <span>Voir instructions & Téléverser</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: INSTRUCTIONS & UPLOAD PAYMENT PROOF */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="border-b border-[#E8E6E2] pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-[#171717]">
                      {t.checkout.step4} & {t.checkout.step5}
                    </h3>
                    <p className="text-xs text-[#737373] mt-1">
                      {t.checkout.paymentInstructionsNotice}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs text-[#737373] hover:text-[#171717] flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Changer méthode</span>
                  </button>
                </div>

                {/* ACCESS CODE & ORDER REFERENCE HIGHLIGHT BOX */}
                <div className="p-5 sm:p-6 bg-gradient-to-br from-[#FAF9F6] via-white to-amber-50/40 rounded-2xl border-2 border-[#EF5A33]/40 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E6E2] pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#EF5A33]/10 text-[#EF5A33] flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#171717]">
                          Vos Identifiants & Code d'Accès de Commande
                        </h4>
                        <p className="text-[11px] text-[#737373]">
                          Généré pour cette transaction — À noter et copier pour plus tard
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSupabaseConfigured && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Supabase Backend Sync
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleCopyAllSummary}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E8E6E2] text-xs font-semibold text-[#171717] hover:border-[#EF5A33] hover:text-[#EF5A33] transition-colors"
                        title="Copier tout le récapitulatif"
                      >
                        {copiedField === 'all_summary' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 text-[11px]">Tout copié !</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Copier le récapitulatif</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Code d'accès Secret */}
                    <div className="p-4 bg-white rounded-xl border-2 border-[#EF5A33]/40 shadow-xs space-y-1.5 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#EF5A33] flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5" />
                          <span>Code d'Accès Secret</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(assignedCredentials?.accessCode || '', 'step3_access_code')}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#EF5A33]/10 text-[#EF5A33] hover:bg-[#EF5A33] hover:text-white transition-colors text-[11px] font-bold cursor-pointer"
                          title="Copier le code d'accès"
                        >
                          {copiedField === 'step3_access_code' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copié !</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copier</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="font-mono text-2xl sm:text-3xl font-black text-[#EF5A33] tracking-widest select-all pt-1">
                        {assignedCredentials?.accessCode || '849201'}
                      </div>
                      <p className="text-[10px] text-[#737373] leading-tight pt-1">
                        Requis pour accéder à votre commande sur la page <strong>Suivre ma commande</strong>.
                      </p>
                    </div>

                    {/* Numéro de Commande / Réf Virement */}
                    <div className="p-4 bg-white rounded-xl border border-[#E8E6E2] shadow-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#171717] flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-[#737373]" />
                          <span>N° Commande (Réf. Virement)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(assignedCredentials?.orderNumber || '', 'step3_order_num')}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#FAF9F6] border border-[#E8E6E2] text-[#171717] hover:border-[#EF5A33] hover:text-[#EF5A33] transition-colors text-[11px] font-semibold cursor-pointer"
                          title="Copier le numéro de commande"
                        >
                          {copiedField === 'step3_order_num' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copié !</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copier</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="font-mono text-base sm:text-lg font-bold text-[#171717] select-all pt-1">
                        {assignedCredentials?.orderNumber || 'ART-2026-84920'}
                      </div>
                      <p className="text-[10px] text-[#737373] leading-tight pt-1">
                        À indiquer en motif / libellé lors de votre transfert.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-2.5">
                    <BookmarkCheck className="w-4 h-4 text-[#EF5A33] shrink-0 mt-0.5" />
                    <span>
                      <strong>Conseil :</strong> Copiez dès maintenant votre <strong>Code d'accès ({assignedCredentials?.accessCode})</strong>. Même si vous quittez ou effectuez le virement ultérieurement, vous pourrez retrouver votre dossier et joindre votre preuve via l'onglet <strong>Suivre ma commande</strong>.
                    </span>
                  </div>
                </div>

                {/* Account Details Box with 1-Click Copy */}
                <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E2] space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {selectedMethod.logo_url && (
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E6E2] p-1 flex items-center justify-center shrink-0">
                          <img
                            src={selectedMethod.logo_url}
                            alt={selectedMethod.name}
                            className="w-full h-full object-contain rounded-lg"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#EF5A33] block">
                          {selectedMethod.name}
                        </span>
                        <span className="text-[11px] text-[#737373]">
                          {locale === 'en' ? selectedMethod.description_en : selectedMethod.description_fr}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#171717] block">
                        Montant à verser :
                      </span>
                      <span className="font-mono font-extrabold text-sm text-[#EF5A33]">
                        {artwork.price.toLocaleString()} {artwork.currency}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-[#E8E6E2] flex items-center justify-between">
                      <div>
                        <span className="text-[#737373] block">{t.checkout.accountName}</span>
                        <span className="font-semibold text-[#171717]">{selectedMethod.account_name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedMethod.account_name, 'name')}
                        className="p-1.5 text-[#737373] hover:text-[#EF5A33] cursor-pointer"
                        title="Copier le nom"
                      >
                        {copiedField === 'name' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-[#E8E6E2] flex items-center justify-between">
                      <div>
                        <span className="text-[#737373] block">{t.checkout.accountNumber}</span>
                        <span className="font-mono font-bold text-[#171717]">{selectedMethod.account_number}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedMethod.account_number, 'number')}
                        className="p-1.5 text-[#737373] hover:text-[#EF5A33] cursor-pointer"
                        title="Copier le numéro"
                      >
                        {copiedField === 'number' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Dynamic transfer instructions highlighting the generated order number */}
                  <div className="p-3.5 bg-white rounded-xl border border-[#E8E6E2] space-y-1.5 text-xs text-[#171717]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#171717] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#EF5A33]" />
                        <span>Référence de transaction à inscrire :</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(assignedCredentials?.orderNumber || '', 'order_ref_inline')}
                        className="text-[11px] font-bold text-[#EF5A33] hover:underline flex items-center gap-1"
                      >
                        {copiedField === 'order_ref_inline' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copier la référence</span>
                      </button>
                    </div>
                    <p className="text-xs text-[#737373] leading-relaxed">
                      Effectuez le transfert <strong>{selectedMethod.name}</strong> vers le compte ci-dessus en inscrivant la référence <strong className="font-mono text-[#EF5A33] bg-[#FAF9F6] px-1.5 py-0.5 rounded border border-[#EF5A33]/30 select-all">{assignedCredentials?.orderNumber}</strong> dans le champ motif/libellé, puis téléversez une capture de la transaction.
                    </p>
                  </div>

                  <p className="text-xs text-[#737373] leading-relaxed">
                    {locale === 'en' ? selectedMethod.instructions_en : selectedMethod.instructions_fr}
                  </p>

                  {(selectedMethod.additional_information_fr || selectedMethod.additional_information_en) && (
                    <p className="text-[11px] text-[#737373]/80 bg-white p-2.5 rounded-lg border border-[#E8E6E2]">
                      {locale === 'en'
                        ? selectedMethod.additional_information_en
                        : selectedMethod.additional_information_fr}
                    </p>
                  )}
                </div>

                {/* Upload Payment Proof Box */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-[#171717] block">
                    {t.checkout.uploadProofTitle} *
                  </label>
                  <p className="text-xs text-[#737373]">
                    {t.checkout.uploadProofDesc}
                  </p>

                  {proofFile ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-emerald-900 line-clamp-1">
                            {proofFile.name}
                          </p>
                          <p className="text-[11px] text-emerald-700">
                            {(proofFile.size / 1024).toFixed(1)} Ko • Reçu prêt à être envoyé
                          </p>
                        </div>
                      </div>
                      <label className="cursor-pointer text-xs font-semibold text-emerald-800 underline hover:text-emerald-950">
                        {t.checkout.changeFile}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-[#E8E6E2] hover:border-[#EF5A33] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-[#FAF9F6] transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center text-[#737373] group-hover:text-[#EF5A33] group-hover:scale-110 transition-all">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-center font-medium text-[#171717]">
                        {t.checkout.dragDropText}
                      </p>
                      <span className="text-[10px] text-[#737373]">
                        JPG, PNG, WEBP, PDF (max 10 Mo)
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Final Submit Options */}
                <div className="pt-4 flex flex-col gap-3">
                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full sm:w-auto text-center py-3 px-5 rounded-full text-xs font-semibold text-[#737373] hover:text-[#171717] hover:bg-[#FAF9F6] transition-colors"
                    >
                      ← Précédent
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting || !proofFile}
                      onClick={() => handleFinalOrderSubmit(true)}
                      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 rounded-full font-semibold text-xs uppercase tracking-wider transition-all shadow-lg text-center ${
                        !proofFile || isSubmitting
                          ? 'bg-[#737373] text-white opacity-50 cursor-not-allowed'
                          : 'bg-[#EF5A33] text-white hover:bg-[#D94725] hover:shadow-xl'
                      }`}
                    >
                      {isSubmitting ? (
                        <span>{t.checkout.orderProcessing}</span>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 shrink-0" />
                          <span>Valider avec ma preuve de paiement</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Option to confirm reservation now and upload proof later */}
                  {!proofFile && (
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleFinalOrderSubmit(false)}
                        className="text-xs text-[#EF5A33] hover:underline font-semibold inline-flex items-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Réserver maintenant et joindre ma preuve plus tard dans le Suivi</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right / Artwork Order Summary Sidebar */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#E8E6E2] shadow-xs space-y-6 sticky top-24">
            <h3 className="font-serif font-bold text-lg text-[#171717] border-b border-[#E8E6E2] pb-3">
              {t.checkout.step1}
            </h3>

            <div className="flex gap-4">
              <img
                src={artwork.images[0]?.url}
                alt={artworkTitle}
                className="w-24 h-24 object-cover rounded-xl border border-[#E8E6E2] shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#EF5A33]">
                    {artwork.artist}
                  </span>
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#FAF9F6] border border-[#E8E6E2] text-[#171717]">
                    {artwork.item_code || 'ART-2026-001'}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-base text-[#171717] line-clamp-1">
                  {artworkTitle}
                </h4>
                <p className="text-xs text-[#737373]">
                  {artwork.width_cm} × {artwork.height_cm} cm • {artwork.year}
                </p>
                <StatusBadge status={artwork.status} type="artwork" locale={locale} size="sm" />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E8E6E2] text-xs">
              <div className="flex justify-between text-[#737373]">
                <span>Sous-total œuvre</span>
                <span className="font-semibold text-[#171717]">
                  {artwork.price.toLocaleString()} {artwork.currency}
                </span>
              </div>
              <div className="flex justify-between text-[#737373]">
                <span>Certificat d’authenticité</span>
                <span className="font-semibold text-emerald-600">Inclus (Offert)</span>
              </div>
              <div className="flex justify-between text-[#737373]">
                <span>Conditionnement d'art</span>
                <span className="font-semibold text-emerald-600">Inclus</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#171717] pt-2 border-t border-[#E8E6E2]">
                <span>Total</span>
                <span className="text-[#EF5A33]">
                  {artwork.price.toLocaleString()} {artwork.currency}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E8E6E2] text-[11px] text-[#737373] space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-[#171717]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#EF5A33]" />
                <span>Garantie de réservation</span>
              </div>
              <p>
                Une fois votre commande soumise, la pièce est mise en révision et protégée contre toute commande concurrente.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
