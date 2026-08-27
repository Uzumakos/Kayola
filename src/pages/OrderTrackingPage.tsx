import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { store } from '../lib/store';
import { fetchOrderForTracking } from '../lib/supabase';
import { Order, OrderStatus } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  Compass,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Upload,
  FileText,
  Printer,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Barcode,
  Hash,
  Copy,
  Check,
} from 'lucide-react';
import { motion } from 'motion/react';

interface OrderTrackingPageProps {
  tokenParam?: string;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ tokenParam }) => {
  const { locale, t, navigate, openLightbox, toast } = useApp();

  const [orderNumberInput, setOrderNumberInput] = useState('');
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast('Copié dans le presse-papier', 'info');
      setTimeout(() => setCopiedField(null), 3000);
    }
  };
  const [resubmitFile, setResubmitFile] = useState<{
    name: string;
    type: string;
    size: number;
    dataUrl: string;
  } | null>(null);
  const [isResubmitting, setIsResubmitting] = useState(false);

  // Auto-search if token is in URL
  useEffect(() => {
    if (tokenParam) {
      const order = store.findOrderByToken(tokenParam);
      if (order) {
        setCurrentOrder(order);
      } else {
        setSearchError(t.tracking.notFoundError);
      }
    }
  }, [tokenParam, t.tracking.notFoundError]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setIsSearching(true);

    try {
      // 1. Check local store first (instant)
      let order = store.findOrderForTracking(orderNumberInput, accessCodeInput);
      
      // 2. Fetch from Supabase to get latest status or if not found locally
      const remoteOrder = await fetchOrderForTracking(orderNumberInput, accessCodeInput);
      
      if (remoteOrder) {
        store.mergeOrders([remoteOrder]);
        // re-fetch from store to get populated artwork/payment_method
        order = store.findOrderForTracking(orderNumberInput, accessCodeInput);
      }

      if (order) {
        setCurrentOrder(order);
        setSearchError(null);
      } else {
        setCurrentOrder(null);
        setSearchError(t.tracking.notFoundError);
      }
    } catch (err) {
      console.error(err);
      setSearchError("Une erreur s'est produite lors de la recherche.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleResubmitProof = () => {
    if (!currentOrder || !resubmitFile) return;

    setIsResubmitting(true);
    const success = store.uploadAdditionalProof(currentOrder.id, resubmitFile);
    if (success) {
      const updated = store.getOrderById(currentOrder.id);
      if (updated) setCurrentOrder(updated);
      setResubmitFile(null);
      toast('Nouvelle preuve transmise avec succès aux commissaires.', 'success');
    } else {
      toast('Erreur lors de la transmission.', 'error');
    }
    setIsResubmitting(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast('Fichier trop lourd (max 10 Mo)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setResubmitFile({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  // Timeline Step Status Helper
  const getTimelineStepStatus = (stepIndex: number, status: OrderStatus) => {
    // 0: Order created, 1: Proof submitted, 2: Verification, 3: Accepted, 4: Confirmed Sold
    switch (status) {
      case 'PENDING':
        return stepIndex === 0 ? 'completed' : 'pending';
      case 'PAYMENT_PROOF_SUBMITTED':
      case 'PAYMENT_REVIEW':
        return stepIndex <= 1 ? 'completed' : stepIndex === 2 ? 'current' : 'pending';
      case 'PAYMENT_ACCEPTED':
        return stepIndex <= 3 ? 'completed' : 'pending';
      case 'PAYMENT_REJECTED':
        return stepIndex <= 1 ? 'completed' : stepIndex === 2 ? 'rejected' : 'pending';
      case 'SOLD':
        return 'completed';
      case 'CANCELLED':
        return stepIndex === 0 ? 'completed' : 'rejected';
      default:
        return 'pending';
    }
  };

  const artworkTitle = currentOrder?.artwork
    ? locale === 'en'
      ? currentOrder.artwork.title_en || currentOrder.artwork.title_fr
      : currentOrder.artwork.title_fr
    : '';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-[#EF5A33]">
          Espace Privé Collectionneur
        </span>
        <h1 className="font-serif italic text-3xl sm:text-5xl font-normal text-[#1A1A1A]">
          {t.tracking.pageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#1A1A1A]/60">
          {t.tracking.pageSubtitle}
        </p>
      </div>

      {/* SEARCH FORM (Always accessible to search or switch order) */}
      {!currentOrder && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 sm:p-10 border border-[#1A1A1A]/10 shadow-2xs max-w-xl mx-auto space-y-6"
        >
          <div className="space-y-1 text-center">
            <h3 className="font-serif italic text-2xl font-normal text-[#1A1A1A]">
              {t.tracking.formTitle}
            </h3>
            <p className="text-xs text-[#1A1A1A]/60">
              Saisissez le numéro de commande ou le <strong>code de l'article</strong> ainsi que votre <strong>code d’accès</strong>.
            </p>
          </div>

          <form onSubmit={handleLookup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60 block flex items-center justify-between">
                <span>Numéro de commande ou Code d'article</span>
                <span className="text-[#EF5A33] font-mono text-[9px]">ex: ART-2026-00124 ou ART-2026-001</span>
              </label>
              <input
                type="text"
                required
                value={orderNumberInput}
                onChange={(e) => setOrderNumberInput(e.target.value)}
                placeholder="Ex: ART-2026-00124 ou ART-2026-001"
                className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#1A1A1A]/15 rounded-xl text-sm font-mono text-[#1A1A1A] focus:outline-hidden focus:border-[#1A1A1A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60 block">
                {t.tracking.accessCodeLabel}
              </label>
              <input
                type="password"
                required
                maxLength={8}
                value={accessCodeInput}
                onChange={(e) => setAccessCodeInput(e.target.value)}
                placeholder={t.tracking.accessCodePlaceholder}
                className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#1A1A1A]/15 rounded-xl text-sm font-mono tracking-widest text-[#1A1A1A] focus:outline-hidden focus:border-[#1A1A1A]"
              />
            </div>

            {searchError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-3.5 rounded-full bg-[#1A1A1A] text-white font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>{isSearching ? t.tracking.searchingText : t.tracking.submitBtn}</span>
            </button>
          </form>


        </motion.div>
      )}

      {/* TRACKING DETAILS VIEW */}
      {currentOrder && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Top Banner with Order # & Switcher */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E6E2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#737373]">
                  Commande
                </span>
                <span className="font-mono text-xl font-extrabold text-[#171717]">
                  {currentOrder.order_number}
                </span>
                <StatusBadge status={currentOrder.status} type="order" locale={locale} />
              </div>
              <p className="text-xs text-[#737373]">
                Initié le {new Date(currentOrder.created_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : locale === 'ht' ? 'ht-HT' : 'en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-full border border-[#E8E6E2] text-xs font-semibold hover:bg-[#FAF9F6] flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-[#737373]" />
                <span>Imprimer</span>
              </button>
              <button
                onClick={() => {
                  setCurrentOrder(null);
                  navigate(`/${locale}/order/track`);
                }}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#737373] hover:text-[#171717]"
              >
                Consulter une autre commande
              </button>
            </div>
          </div>

          {/* Collector Identification & Security Card (Order #, Article Code, Access Code) */}
          <div className="bg-[#FAF9F6] p-6 rounded-3xl border-2 border-[#EF5A33]/20 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E6E2] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#EF5A33]" />
                <h4 className="font-serif font-bold text-base text-[#171717]">
                  Identifiants & Codes de Sécurité de la Commande
                </h4>
              </div>
              <span className="text-[11px] text-[#737373] hidden sm:inline">
                Conservez ces codes pour toute correspondance
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Numéro de commande */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E6E2] space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] flex items-center gap-1">
                  <Hash className="w-3 h-3 text-[#EF5A33]" />
                  <span>N° de Commande</span>
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-[#171717] select-all">
                    {currentOrder.order_number}
                  </span>
                  <button
                    onClick={() => handleCopy(currentOrder.order_number, 'track_order_num')}
                    className="p-1.5 text-[#737373] hover:text-[#EF5A33] rounded-md hover:bg-[#FAF9F6]"
                    title="Copier le numéro"
                  >
                    {copiedField === 'track_order_num' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Code de l'article */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E6E2] space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] flex items-center gap-1">
                  <Barcode className="w-3 h-3 text-[#EF5A33]" />
                  <span>Code de l'article (Réf)</span>
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-extrabold text-[#171717] select-all">
                    {currentOrder.artwork?.item_code || 'ART-2026-001'}
                  </span>
                  <button
                    onClick={() => handleCopy(currentOrder.artwork?.item_code || 'ART-2026-001', 'track_item_code')}
                    className="p-1.5 text-[#737373] hover:text-[#EF5A33] rounded-md hover:bg-[#FAF9F6]"
                    title="Copier le code article"
                  >
                    {copiedField === 'track_item_code' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Code d'accès */}
              <div className="bg-white p-4 rounded-2xl border border-[#EF5A33]/40 space-y-1.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#EF5A33] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Code d'accès secret</span>
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-black text-[#EF5A33] tracking-wider select-all">
                    {currentOrder.access_code}
                  </span>
                  <button
                    onClick={() => handleCopy(currentOrder.access_code, 'track_access_code')}
                    className="p-1.5 text-[#737373] hover:text-[#EF5A33] rounded-md hover:bg-[#FAF9F6]"
                    title="Copier le code d'accès"
                  >
                    {copiedField === 'track_access_code' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ACQUISITION TIMELINE */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E8E6E2] shadow-xs space-y-6">
            <h3 className="font-serif font-bold text-xl text-[#171717]">
              {t.tracking.timelineTitle}
            </h3>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-[#E8E6E2] space-y-8 my-4">
              {/* Step 1: Order Received */}
              <div className="relative">
                <span className="absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-xs">
                  ✓
                </span>
                <div className="space-y-0.5">
                  <p className="font-serif font-bold text-sm text-[#171717]">
                    {t.tracking.stepOrderReceived}
                  </p>
                  <p className="text-xs text-[#737373]">
                    Commande validée et transmise à la galerie.
                  </p>
                </div>
              </div>

              {/* Step 2: Proof Submitted */}
              <div className="relative">
                <span
                  className={`absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-xs ${
                    getTimelineStepStatus(1, currentOrder.status) === 'completed'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {getTimelineStepStatus(1, currentOrder.status) === 'completed' ? '✓' : '2'}
                </span>
                <div className="space-y-0.5">
                  <p className="font-serif font-bold text-sm text-[#171717]">
                    {t.tracking.stepProofSubmitted}
                  </p>
                  <p className="text-xs text-[#737373]">
                    {currentOrder.payment_submitted_at
                      ? `Preuve téléversée (${currentOrder.payment_proofs[0]?.file_name || 'reçu de paiement'}).`
                      : 'En attente de versement et de transmission du reçu.'}
                  </p>
                </div>
              </div>

              {/* Step 3: Administrative Verification */}
              <div className="relative">
                <span
                  className={`absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-xs ${
                    getTimelineStepStatus(2, currentOrder.status) === 'completed'
                      ? 'bg-emerald-500 text-white'
                      : getTimelineStepStatus(2, currentOrder.status) === 'rejected'
                      ? 'bg-rose-500 text-white'
                      : getTimelineStepStatus(2, currentOrder.status) === 'current'
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {getTimelineStepStatus(2, currentOrder.status) === 'completed'
                    ? '✓'
                    : getTimelineStepStatus(2, currentOrder.status) === 'rejected'
                    ? '✕'
                    : '3'}
                </span>
                <div className="space-y-0.5">
                  <p className="font-serif font-bold text-sm text-[#171717]">
                    {t.tracking.stepVerification}
                  </p>
                  <p className="text-xs text-[#737373]">
                    {currentOrder.status === 'PAYMENT_REVIEW'
                      ? 'Vérification manuelle en cours par le commissaire.'
                      : currentOrder.status === 'PAYMENT_ACCEPTED' || currentOrder.status === 'SOLD'
                      ? 'Vérification effectuée avec succès.'
                      : currentOrder.status === 'PAYMENT_REJECTED'
                      ? 'Preuve rejetée. Veuillez soumettre une nouvelle preuve ci-dessous.'
                      : 'En attente de réception de la preuve.'}
                  </p>
                </div>
              </div>

              {/* Step 4: Payment Verified */}
              <div className="relative">
                <span
                  className={`absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-xs ${
                    getTimelineStepStatus(3, currentOrder.status) === 'completed'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {getTimelineStepStatus(3, currentOrder.status) === 'completed' ? '✓' : '4'}
                </span>
                <div className="space-y-0.5">
                  <p className="font-serif font-bold text-sm text-[#171717]">
                    {t.tracking.stepAccepted}
                  </p>
                  <p className="text-xs text-[#737373]">
                    Fonds validés sur le compte de la galerie.
                  </p>
                </div>
              </div>

              {/* Step 5: Sale Confirmed & Sold */}
              <div className="relative">
                <span
                  className={`absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-xs ${
                    currentOrder.status === 'SOLD'
                      ? 'bg-[#171717] text-[#EF5A33]'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentOrder.status === 'SOLD' ? '★' : '5'}
                </span>
                <div className="space-y-0.5">
                  <p className="font-serif font-bold text-sm text-[#171717]">
                    {t.tracking.stepSold}
                  </p>
                  <p className="text-xs text-[#737373]">
                    {currentOrder.status === 'SOLD'
                      ? 'Acquisition définitive et certificat d’authenticité signé.'
                      : 'Validation finale par la direction de la galerie.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Proof Management Section for PENDING, PAYMENT_REVIEW or PAYMENT_REJECTED */}
            {currentOrder.status !== 'SOLD' && (
              <div className="p-6 bg-white rounded-3xl border border-[#E8E6E2] space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8E6E2] pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#EF5A33]" />
                    <h4 className="font-serif font-bold text-base text-[#171717]">
                      Preuve de règlement & Justificatif de virement
                    </h4>
                  </div>
                  <span className="text-xs text-[#737373]">
                    {currentOrder.payment_proofs.length > 0
                      ? `${currentOrder.payment_proofs.length} preuve(s) soumise(s)`
                      : 'Aucune preuve soumise pour le moment'}
                  </span>
                </div>

                {/* Upload or Update new proof */}
                <div className="space-y-3">
                  <p className="text-xs text-[#737373]">
                    Vous avez effectué votre virement bancaire ou paiement mobile ? Joignez votre reçu ou capture d'écran ci-dessous pour validation par nos commissaires :
                  </p>

                  {resubmitFile ? (
                    <div className="p-4 bg-[#FAF9F6] rounded-2xl border-2 border-[#EF5A33]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E6E2] flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[#EF5A33]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#171717] font-mono">{resubmitFile.name}</p>
                          <p className="text-[10px] text-[#737373]">{(resubmitFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => setResubmitFile(null)}
                          className="flex-1 sm:flex-initial px-4 py-2 rounded-full border border-[#E8E6E2] text-xs font-semibold hover:bg-white"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleResubmitProof}
                          disabled={isResubmitting}
                          className="flex-1 sm:flex-initial px-6 py-2 rounded-full bg-[#EF5A33] text-white text-xs font-bold hover:bg-[#D94725] shadow-md"
                        >
                          {isResubmitting ? 'Envoi en cours...' : 'Transmettre ma preuve'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#171717] text-white text-xs font-bold cursor-pointer hover:bg-black transition-all shadow-md">
                      <Upload className="w-4 h-4 text-[#EF5A33]" />
                      <span>Téléverser / Ajouter une preuve de paiement</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* List of existing proofs */}
                {currentOrder.payment_proofs.length > 0 && (
                  <div className="pt-3 border-t border-[#E8E6E2] space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#737373]">
                      Historique des reçus transmis :
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentOrder.payment_proofs.map((proof) => (
                        <div
                          key={proof.id}
                          className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E8E6E2] flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <FileText className="w-4 h-4 text-[#EF5A33] shrink-0" />
                            <div className="truncate">
                              <p className="font-mono font-medium truncate text-[#171717]">{proof.file_name}</p>
                              <p className="text-[10px] text-[#737373]">
                                {new Date(proof.uploaded_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : locale === 'ht' ? 'ht-HT' : 'en-US')}
                              </p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                            proof.status === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : proof.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {proof.status === 'VERIFIED' ? 'Vérifié' : proof.status === 'REJECTED' ? 'Rejeté' : 'En révision'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rejection Alert Box */}
            {currentOrder.status === 'PAYMENT_REJECTED' && (
              <div className="p-6 bg-rose-50 rounded-2xl border border-rose-200 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-serif font-bold text-sm text-rose-900">
                      {t.tracking.rejectionAlert}
                    </p>
                    <p className="text-xs text-rose-800">
                      {currentOrder.rejection_reason || 'Preuve illisible ou référence introuvable.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Official Certificate for SOLD orders */}
            {currentOrder.status === 'SOLD' && (
              <div className="p-6 bg-[#FAF9F6] rounded-2xl border-2 border-[#EF5A33]/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EF5A33] text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#171717]">
                      Acquisition Officielle & Certifiée
                    </h4>
                    <p className="text-xs text-[#737373]">
                      L'œuvre vous est officiellement attribuée de manière permanente.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#171717] text-white text-xs font-semibold hover:bg-black shadow-md"
                  >
                    <FileText className="w-4 h-4 text-[#EF5A33]" />
                    <span>{t.tracking.certificateBtn}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ORDER & ARTWORK BREAKDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Artwork Card */}
            {currentOrder.artwork && (
              <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#E8E6E2] shadow-xs space-y-4">
                <h4 className="font-serif font-bold text-base text-[#171717] border-b border-[#E8E6E2] pb-3">
                  Œuvre commandée
                </h4>

                <div className="flex gap-4">
                  <img
                    src={currentOrder.artwork.images[0]?.url}
                    alt={artworkTitle}
                    className="w-28 h-28 object-cover rounded-2xl border border-[#E8E6E2] shrink-0 cursor-pointer"
                    onClick={() => openLightbox(currentOrder.artwork!.images[0]?.url)}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#EF5A33]">
                        {currentOrder.artwork.artist}
                      </span>
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#FAF9F6] border border-[#E8E6E2] text-[#171717]">
                        {currentOrder.artwork.item_code || 'ART-2026-001'}
                      </span>
                    </div>
                    <h5 className="font-serif font-bold text-lg text-[#171717] line-clamp-1">
                      {artworkTitle}
                    </h5>
                    <p className="text-xs text-[#737373]">
                      {currentOrder.artwork.year} • {currentOrder.artwork.width_cm} × {currentOrder.artwork.height_cm} cm
                    </p>
                    <p className="text-base font-bold text-[#171717] pt-1">
                      {currentOrder.amount.toLocaleString()} {currentOrder.currency}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Customer & Delivery Information */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#E8E6E2] shadow-xs space-y-4">
              <h4 className="font-serif font-bold text-base text-[#171717] border-b border-[#E8E6E2] pb-3">
                Coordonnées de livraison
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#737373] block">Destinataire</span>
                  <span className="font-semibold text-[#171717]">
                    {currentOrder.customer_first_name} {currentOrder.customer_last_name}
                  </span>
                </div>
                <div>
                  <span className="text-[#737373] block">Contact</span>
                  <span className="font-semibold text-[#171717]">
                    {currentOrder.customer_email}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#737373] block">Adresse</span>
                  <span className="font-semibold text-[#171717]">
                    {currentOrder.customer_address}, {currentOrder.customer_city}, {currentOrder.customer_country}
                  </span>
                </div>
                <div>
                  <span className="text-[#737373] block">Téléphone</span>
                  <span className="font-semibold text-[#171717]">
                    {currentOrder.customer_phone}
                  </span>
                </div>
                <div>
                  <span className="text-[#737373] block">Mode de règlement</span>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {currentOrder.payment_method?.logo_url && (
                      <img
                        src={currentOrder.payment_method.logo_url}
                        alt=""
                        className="w-4 h-4 object-contain rounded-xs"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <span className="font-semibold text-[#EF5A33]">
                      {currentOrder.payment_method?.name || 'Virement bancaire'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Need help footer */}
          <div className="p-6 bg-white rounded-3xl border border-[#E8E6E2] text-center space-y-3">
            <h4 className="font-serif font-bold text-base text-[#171717]">
              {t.tracking.needHelp}
            </h4>
            <p className="text-xs text-[#737373] max-w-md mx-auto">
              Nos commissaires d’art sont à votre disposition pour vous assister dans le suivi de votre commande.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-xs font-semibold text-[#EF5A33]">
              <a href="mailto:contact@kayola-art.com" className="inline-flex items-center gap-1.5 hover:underline">
                <Mail className="w-3.5 h-3.5" />
                <span>contact@kayola-art.com</span>
              </a>
              <span className="text-[#E8E6E2]">•</span>
              <a href="tel:+50938000000" className="inline-flex items-center gap-1.5 hover:underline">
                <Phone className="w-3.5 h-3.5" />
                <span>+509 3800-0000</span>
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
