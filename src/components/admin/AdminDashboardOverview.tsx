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

export const AdminDashboardOverview: React.FC<any> = (props) => {
  const { 
    store, navigate, openLightbox, toast, setActiveTab,
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
        <div className="space-y-8">
          {/* Key Metrics Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E8E6E2] shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
                {t.admin.stats.totalArtworks}
              </span>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#171717]">
                {totalArtworks}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E6E2] shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
                {t.admin.stats.availableArtworks}
              </span>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-emerald-600">
                {availableArtworks}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E6E2] shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
                {t.admin.stats.paymentsToReview}
              </span>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#EF5A33]">
                {paymentsToReview}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E6E2] shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
                {t.admin.stats.soldArtworks}
              </span>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#171717]">
                {soldArtworks}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E6E2] shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
                {t.admin.stats.totalOrders}
              </span>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#171717]">
                {totalOrders}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8E6E2] shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
                {t.admin.stats.totalVolume}
              </span>
              <p className="text-xl sm:text-2xl font-sans font-bold text-[#171717]">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Urgent Orders Requiring Review */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E6E2] shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#171717]">
                  Preuves de Paiement à Vérifier
                </h3>
                <p className="text-xs text-[#737373]">
                  Commandes reçues nécessitant l'approbation d'un commissaire.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('orders');
                  setOrderFilter('review');
                }}
                className="text-xs font-semibold text-[#EF5A33] hover:underline"
              >
                Voir toutes les commandes →
              </button>
            </div>

            {orders.filter((o) => o.status === 'PAYMENT_REVIEW' || o.status === 'PAYMENT_PROOF_SUBMITTED').length === 0 ? (
              <p className="text-xs text-[#737373] italic py-4">
                Toutes les preuves de paiement ont été traitées.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders
                  .filter((o) => o.status === 'PAYMENT_REVIEW' || o.status === 'PAYMENT_PROOF_SUBMITTED')
                  .map((order) => (
                    <div
                      key={order.id}
                      className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E2] flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-[#171717]">
                            {order.order_number}
                          </span>
                          <StatusBadge status={order.status} type="order" locale={locale} size="sm" />
                        </div>
                        <p className="text-xs font-semibold text-[#171717]">
                          Client : {order.customer_first_name} {order.customer_last_name}
                        </p>
                        <p className="text-xs text-[#737373]">
                          Montant : {order.amount.toLocaleString()} {order.currency} via {order.payment_method?.name || 'Virement'}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-4 py-2 rounded-full bg-[#171717] text-white text-xs font-semibold hover:bg-[#EF5A33] transition-colors shrink-0"
                      >
                        Examiner la preuve
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      
    </>
  );
};
