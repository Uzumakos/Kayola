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

export const AdminPaymentMethodsTab: React.FC<any> = (props) => {
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
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E6E2] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E6E2] pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-serif font-bold text-xl text-[#171717]">
                  {t.admin.paymentMethods}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FAF9F6] border border-[#E8E6E2] text-xs font-semibold text-[#737373]">
                  {paymentMethods.length}
                </span>
              </div>
              <p className="text-xs text-[#737373] mt-1">
                Configurez, activez et personnalisez les logos, coordonnées et instructions de paiement affichées aux acheteurs.
              </p>
            </div>

            <button
              onClick={handleOpenAddPaymentMethod}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EF5A33] text-white text-xs font-semibold hover:bg-[#D94725] transition-colors shadow-xs shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{t.admin.paymentModal?.createTitle || 'Ajouter un moyen de paiement'}</span>
            </button>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-[#FAF9F6] rounded-2xl border border-dashed border-[#E8E6E2]">
              <CreditCard className="w-8 h-8 text-[#737373] mx-auto opacity-50" />
              <p className="text-sm font-semibold text-[#171717]">Aucun moyen de paiement configuré</p>
              <p className="text-xs text-[#737373]">Cliquez sur le bouton ci-dessus pour ajouter votre premier canal de paiement.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paymentMethods.map((method) => {
                const getMethodIcon = () => {
                  if (method.type === 'moncash' || method.type === 'natcash') return <Smartphone className="w-5 h-5 text-[#EF5A33]" />;
                  if (method.type === 'wire') return <Globe className="w-5 h-5 text-indigo-600" />;
                  if (method.type === 'bank_transfer') return <Building2 className="w-5 h-5 text-emerald-600" />;
                  return <CreditCard className="w-5 h-5 text-[#737373]" />;
                };

                return (
                  <div
                    key={method.id}
                    className={`p-6 bg-[#FAF9F6] rounded-3xl border transition-all space-y-5 flex flex-col justify-between ${
                      method.is_active ? 'border-[#E8E6E2] shadow-xs' : 'border-gray-200 opacity-75'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Card Header: Logo/Icon + Name + Actions */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          {/* Logo Image or Fallback Icon */}
                          <div className="w-14 h-14 rounded-2xl bg-white border border-[#E8E6E2] overflow-hidden flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                            {method.logo_url ? (
                              <img
                                src={method.logo_url}
                                alt={method.name}
                                className="w-full h-full object-contain rounded-xl"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  // Fallback if URL broken
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              getMethodIcon()
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-serif font-bold text-base text-[#171717] leading-tight">
                                {method.name}
                              </h4>
                              <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8E6E2] text-[10px] font-mono text-[#737373] uppercase">
                                {method.type}
                              </span>
                            </div>
                            <p className="text-xs text-[#737373] line-clamp-1">
                              {locale === 'en' ? method.description_en : locale === 'ht' ? (method.description_ht || method.description_fr) : method.description_fr}
                            </p>
                          </div>
                        </div>

                        {/* Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleEditPaymentMethod(method)}
                            className="p-2 rounded-full bg-white border border-[#E8E6E2] text-[#737373] hover:text-[#EF5A33] hover:border-[#EF5A33] transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePaymentMethod(method.id, method.name)}
                            className="p-2 rounded-full bg-white border border-[#E8E6E2] text-[#737373] hover:text-rose-600 hover:border-rose-300 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="p-3.5 bg-white rounded-2xl border border-[#E8E6E2] space-y-2 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <span className="text-[11px] text-[#737373] block">Bénéficiaire / Titulaire</span>
                            <span className="font-semibold text-[#171717]">{method.account_name}</span>
                          </div>
                          <div>
                            <span className="text-[11px] text-[#737373] block">Compte / IBAN / Tél</span>
                            <span className="font-mono font-bold text-[#171717]">{method.account_number}</span>
                          </div>
                        </div>

                        {method.phone_number && method.phone_number !== method.account_number && (
                          <div className="pt-1 border-t border-[#E8E6E2]/60">
                            <span className="text-[11px] text-[#737373] block">Contact Tél :</span>
                            <span className="font-semibold text-[#171717]">{method.phone_number}</span>
                          </div>
                        )}

                        <div className="pt-1 border-t border-[#E8E6E2]/60">
                          <span className="text-[11px] text-[#737373] block">Instructions de paiement :</span>
                          <p className="text-[11px] text-[#737373] line-clamp-2 leading-relaxed">
                            {locale === 'en' ? method.instructions_en : locale === 'ht' ? (method.instructions_ht || method.instructions_fr) : method.instructions_fr}
                          </p>
                        </div>

                        {(method.additional_information_fr || method.additional_information_en) && (
                          <div className="pt-1 border-t border-[#E8E6E2]/60">
                            <span className="text-[10px] text-[#737373] block font-mono">Détails Swift / Agence :</span>
                            <p className="text-[11px] text-[#737373]/90 italic">
                              {locale === 'en' ? method.additional_information_en : locale === 'ht' ? (method.additional_information_ht || method.additional_information_fr) : method.additional_information_fr}
                            </p>
                          </div>
                        )}

                        {method.logo_url && (
                          <div className="pt-1 border-t border-[#E8E6E2]/60 flex items-center justify-between text-[11px]">
                            <span className="text-[#737373] flex items-center gap-1">
                              <Link2 className="w-3 h-3 text-[#EF5A33]" />
                              <span>Logo lié</span>
                            </span>
                            <a
                              href={method.logo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-[#EF5A33] hover:underline font-mono truncate max-w-[200px]"
                            >
                              {method.logo_url}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Status & Quick Toggle */}
                    <div className="pt-2 flex items-center justify-between border-t border-[#E8E6E2]/60">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          method.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${method.is_active ? 'bg-emerald-600' : 'bg-gray-500'}`} />
                        <span>{method.is_active ? 'Actif sur le Checkout' : 'Désactivé (Masqué)'}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleTogglePaymentMethod(method.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          method.is_active
                            ? 'bg-white border border-[#E8E6E2] text-[#737373] hover:text-[#171717]'
                            : 'bg-[#171717] text-white hover:bg-black'
                        }`}
                      >
                        {method.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      
    </>
  );
};
