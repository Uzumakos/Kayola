import React from 'react';
import { 
  Plus, Edit2, Trash2, Check, X, Eye, Copy, AlertCircle, Clock, 
  ShieldCheck, CheckCircle2, FileText, DollarSign, Search, 
  ExternalLink, ChevronRight, Building2, Smartphone, Globe, 
  Image as ImageIcon, Link2, Sparkles, Barcode, Hash, QrCode, RotateCcw, Palette, FolderKanban, CreditCard, ShoppingBag, Settings, LogOut, LayoutDashboard
} from 'lucide-react';
import { Artwork, Category, Order, PaymentMethod, GallerySettings } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { store } from '../../lib/store';

export const AdminSettingsTab: React.FC<any> = (props) => {
  const { 
    store, navigate, openLightbox, toast,
    t, locale, artworks, categories, paymentMethods, orders, settings,
    totalArtworks, availableArtworks, reservedArtworks, paymentsToReview, totalOrders, soldArtworks, totalRevenue,
    orderFilter, setOrderFilter, filteredOrders, setSelectedOrder, selectedOrder, rejectionReason, setRejectionReason,
    handleAcceptPayment, handleRejectPayment, handleConfirmSale, setRejectModalOpen, setConfirmSaleModalOpen, handleCopy,
    setArtworkModalOpen, setEditingArtwork, setArtworkImageLoadError, handleSaveArtwork,
    setCategoryModalOpen, setEditingCategory, setCategoryImageLoadError, handleOpenAddCategory, handleEditCategory, handleDeleteCategory, handleSaveCategory,
    setPaymentModalOpen, setEditingPaymentMethod, setImageLoadError, handleOpenAddPaymentMethod, handleEditPaymentMethod, handleDeletePaymentMethod, handleTogglePaymentMethod, handleSavePaymentMethod,
    handleDeleteArtwork,
    logoUrlInput, setLogoUrlInput, galleryNameInput, setGalleryNameInput,
    taglineFrInput, setTaglineFrInput, taglineEnInput, setTaglineEnInput,
    logoImageLoadError, setLogoImageLoadError, previewMode, setPreviewMode,
    handleSaveGallerySettings, handleResetToDefaultLogo,
    PRESET_PAYMENT_LOGOS, PRESET_ARTWORK_IMAGES, PRESET_CATEGORY_IMAGES, PRESET_GALLERY_LOGOS
  } = props;

  return (
    <>
        <div className="space-y-8 max-w-5xl">
          {/* Header */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E6E2] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EF5A33]/10 text-[#EF5A33] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Identité Visuelle & Image de Marque</span>
              </div>
              <h3 className="font-serif font-bold text-2xl text-[#171717]">
                Configuration du Logo & de la Galerie
              </h3>
              <p className="text-sm text-[#737373] max-w-2xl">
                Personnalisez le logo de <strong>KAYOLA</strong> en ajoutant un lien d’image direct (URL). Les modifications s’appliquent instantanément sur la barre de navigation, le pied de page, les reçus et certificats.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleResetToDefaultLogo}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#E8E6E2] text-xs font-semibold text-[#737373] hover:text-[#171717] hover:border-[#171717] transition-colors"
                title="Rétablir l'emblème original"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Logo par défaut</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Settings Form (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleSaveGallerySettings} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E6E2] shadow-xs space-y-6">
                <h4 className="font-serif font-bold text-lg text-[#171717] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#EF5A33]" />
                  <span>Lien de l’Image du Logo</span>
                </h4>

                {/* Logo Image URL Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#737373]">
                    URL Directe de l’image du Logo (HTTPS)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737373]">
                      <Link2 className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={logoUrlInput}
                      onChange={(e) => {
                        setLogoUrlInput(e.target.value);
                        setLogoImageLoadError(false);
                      }}
                      placeholder="https://mon-domaine.com/images/logo-kayola.png"
                      className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E2] text-sm text-[#171717] placeholder:text-[#A3A3A3] focus:outline-hidden focus:border-[#171717] transition-all font-mono"
                    />
                    {logoUrlInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setLogoUrlInput('');
                          setLogoImageLoadError(false);
                        }}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#737373] hover:text-[#171717]"
                        title="Effacer le lien"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-[#737373]">
                    Formats recommandés : <strong>PNG transparent</strong>, <strong>SVG</strong> ou <strong>WebP/JPG</strong> haute résolution (ratio carré ou horizontal épuré).
                  </p>
                </div>

                {/* Quick Presets / Examples for Testing */}
                <div className="space-y-2.5 pt-2 border-t border-[#E8E6E2]">
                  <label className="block text-xs font-semibold text-[#737373] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#EF5A33]" />
                    <span>Suggestions de logos & emblèmes artistiques (1 clic) :</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PRESET_GALLERY_LOGOS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setLogoUrlInput(preset.url);
                          setLogoImageLoadError(false);
                        }}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border text-left text-xs transition-all ${
                          logoUrlInput === preset.url
                            ? 'bg-[#EF5A33]/10 border-[#EF5A33] text-[#EF5A33] font-semibold'
                            : 'bg-[#FAF9F6] border-[#E8E6E2] text-[#171717] hover:border-[#171717]'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-white border border-[#E8E6E2] shrink-0">
                          <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <span className="truncate">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Gallery Identity Fields */}
                <div className="space-y-4 pt-4 border-t border-[#E8E6E2]">
                  <h5 className="font-serif font-bold text-sm text-[#171717]">
                    Informations Complémentaires de Marque
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#737373]">
                        Nom de la Galerie
                      </label>
                      <input
                        type="text"
                        value={galleryNameInput}
                        onChange={(e) => setGalleryNameInput(e.target.value)}
                        placeholder="KAYOLA"
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E2] text-sm text-[#171717] focus:outline-hidden focus:border-[#171717]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#737373]">
                        Slogan Français
                      </label>
                      <input
                        type="text"
                        value={taglineFrInput}
                        onChange={(e) => setTaglineFrInput(e.target.value)}
                        placeholder="Art Contemporain"
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E2] text-sm text-[#171717] focus:outline-hidden focus:border-[#171717]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#737373]">
                      Slogan Anglais
                    </label>
                    <input
                      type="text"
                      value={taglineEnInput}
                      onChange={(e) => setTaglineEnInput(e.target.value)}
                      placeholder="Contemporary Art"
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E2] text-sm text-[#171717] focus:outline-hidden focus:border-[#171717]"
                    />
                  </div>
                </div>

                {/* Coordonnées de Contact */}
                <div className="space-y-4 pt-4 border-t border-[#E8E6E2]">
                  <h5 className="font-serif font-bold text-sm text-[#171717]">
                    Coordonnées de Contact & Adresse
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#737373]">
                        Email de Contact
                      </label>
                      <input
                        type="email"
                        value={props.contactEmailInput}
                        onChange={(e) => props.setContactEmailInput(e.target.value)}
                        placeholder="contact@kayola-art.com"
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E2] text-sm text-[#171717] focus:outline-hidden focus:border-[#171717]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#737373]">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={props.contactPhoneInput}
                        onChange={(e) => props.setContactPhoneInput(e.target.value)}
                        placeholder="+509 3800-0000"
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E2] text-sm text-[#171717] focus:outline-hidden focus:border-[#171717]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#737373]">
                      Adresse Physique
                    </label>
                    <input
                      type="text"
                      value={props.addressInput}
                      onChange={(e) => props.setAddressInput(e.target.value)}
                      placeholder="Espace KAYOLA — Quartier des Galeries, Port-au-Prince"
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E2] text-sm text-[#171717] focus:outline-hidden focus:border-[#171717]"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-[#E8E6E2] flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-full bg-[#171717] text-white text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors flex items-center gap-2 shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Enregistrer l’Identité & le Logo</span>
                  </button>
                </div>
              </form>
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E6E2] shadow-xs space-y-6 sticky top-28">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-base text-[#171717] flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#EF5A33]" />
                    <span>Aperçu en Direct</span>
                  </h4>

                  {/* Mode switcher for preview */}
                  <div className="flex items-center gap-1 bg-[#FAF9F6] p-1 rounded-full border border-[#E8E6E2]">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('light')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        previewMode === 'light'
                          ? 'bg-white text-[#171717] shadow-2xs font-semibold'
                          : 'text-[#737373] hover:text-[#171717]'
                      }`}
                    >
                      En-tête (Clair)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('dark')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        previewMode === 'dark'
                          ? 'bg-[#171717] text-white shadow-2xs font-semibold'
                          : 'text-[#737373] hover:text-[#171717]'
                      }`}
                    >
                      Pied de page (Sombre)
                    </button>
                  </div>
                </div>

                {/* Preview Surface */}
                <div
                  className={`p-6 rounded-2xl border transition-all flex flex-col items-center justify-center min-h-[180px] space-y-4 text-center ${
                    previewMode === 'dark'
                      ? 'bg-[#171717] border-black text-white'
                      : 'bg-[#FAF9F6] border-[#E8E6E2] text-[#171717]'
                  }`}
                >
                  {/* Dynamic Logo rendering based on input or store */}
                  {logoUrlInput.trim() && !logoImageLoadError ? (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white border border-[#E8E6E2] shadow-sm shrink-0">
                        <img
                          src={logoUrlInput.trim()}
                          alt="Aperçu Logo"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={() => setLogoImageLoadError(true)}
                        />
                      </div>
                      <div className="flex flex-col text-left">
                        <span
                          className={`font-black tracking-tighter uppercase text-xl ${
                            previewMode === 'dark' ? 'text-white' : 'text-[#171717]'
                          }`}
                        >
                          {galleryNameInput || 'KAYOLA'}
                        </span>
                        <span
                          className={`text-[9px] uppercase tracking-[0.25em] font-medium -mt-1 ${
                            previewMode === 'dark' ? 'text-white/60' : 'text-[#171717]/50'
                          }`}
                        >
                          {taglineFrInput || 'Art Contemporain'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {/* Default Coral Badge */}
                      <div className="w-12 h-12 rounded-full bg-[#EF5A33] flex items-center justify-center shadow-sm shrink-0">
                        <svg viewBox="0 0 100 100" className="w-3/5 h-3/5 text-white fill-current" xmlns="http://www.w3.org/2000/svg">
                          <path d="M32 40 L44 58 L44 76 C44 78 41 80 37 80 C33 80 30 78 30 76 L30 72 L36 72 L36 58 L24 40 L32 40 Z" fill="white" />
                          <path d="M44 58 C52 58 64 56 68 47 C72 38 68 28 58 28 C48 28 42 36 42 46 C42 52 45 56 50 56 C55 56 58 52 58 46 C58 40 54 36 50 36 C47 36 45 38 45 42 L40 42 C40 34 46 30 52 30 C62 30 66 38 62 48 C58 56 48 56 42 56" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" />
                        </svg>
                      </div>
                      <div className="flex flex-col text-left">
                        <span
                          className={`font-black tracking-tighter uppercase text-xl ${
                            previewMode === 'dark' ? 'text-white' : 'text-[#171717]'
                          }`}
                        >
                          {galleryNameInput || 'KAYOLA'}
                        </span>
                        <span
                          className={`text-[9px] uppercase tracking-[0.25em] font-medium -mt-1 ${
                            previewMode === 'dark' ? 'text-white/60' : 'text-[#171717]/50'
                          }`}
                        >
                          {taglineFrInput || 'Art Contemporain'}
                        </span>
                      </div>
                    </div>
                  )}

                  {logoImageLoadError && logoUrlInput && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 text-left">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>Impossible de charger l'image depuis cette URL. L'emblème par défaut sera affiché en secours.</span>
                    </div>
                  )}
                </div>

                {/* Summary status */}
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E2] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#737373]">
                    <span>Type de logo actif :</span>
                    <span className="font-semibold text-[#171717]">
                      {settings.logo_url ? 'Image Personnalisée' : 'Monogramme Vectoriel'}
                    </span>
                  </div>
                  {settings.logo_url && (
                    <div className="flex items-center justify-between text-[#737373]">
                      <span>Lien enregistré :</span>
                      <a
                        href={settings.logo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#EF5A33] hover:underline font-mono truncate max-w-[160px]"
                      >
                        {settings.logo_url}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[#737373]">
                    <span>Nom de marque :</span>
                    <span className="font-semibold text-[#171717]">{settings.gallery_name || 'KAYOLA'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      
    </>
  );
};
