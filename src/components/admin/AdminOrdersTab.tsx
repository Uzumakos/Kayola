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

export const AdminOrdersTab: React.FC<any> = (props) => {
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
              <h3 className="font-serif font-bold text-xl text-[#171717]">
                {t.admin.ordersList.title}
              </h3>
              <p className="text-xs text-[#737373]">
                {t.admin.ordersList.subtitle}
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setOrderFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  orderFilter === 'all' ? 'bg-[#171717] text-white' : 'bg-[#FAF9F6] text-[#737373]'
                }`}
              >
                {t.admin.ordersList.filterAll} ({orders.length})
              </button>
              <button
                onClick={() => setOrderFilter('review')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  orderFilter === 'review' ? 'bg-[#EF5A33] text-white' : 'bg-[#FAF9F6] text-[#737373]'
                }`}
              >
                {t.admin.ordersList.filterReview}
              </button>
              <button
                onClick={() => setOrderFilter('accepted')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  orderFilter === 'accepted' ? 'bg-emerald-600 text-white' : 'bg-[#FAF9F6] text-[#737373]'
                }`}
              >
                {t.admin.ordersList.filterAccepted}
              </button>
              <button
                onClick={() => setOrderFilter('sold')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  orderFilter === 'sold' ? 'bg-black text-[#EF5A33]' : 'bg-[#FAF9F6] text-[#737373]'
                }`}
              >
                {t.admin.ordersList.filterSold}
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8E6E2] text-[#737373] uppercase tracking-wider font-semibold">
                  <th className="pb-3 pr-4">{t.admin.ordersList.colOrder}</th>
                  <th className="pb-3 px-4">{t.admin.ordersList.colCustomer}</th>
                  <th className="pb-3 px-4">{t.admin.ordersList.colArtwork}</th>
                  <th className="pb-3 px-4">{t.admin.ordersList.colAmount}</th>
                  <th className="pb-3 px-4">{t.admin.ordersList.colPayment}</th>
                  <th className="pb-3 px-4">{t.admin.ordersList.colStatus}</th>
                  <th className="pb-3 pl-4 text-right">{t.admin.ordersList.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E6E2]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-4 pr-4 font-mono font-bold text-[#171717]">
                      {order.order_number}
                    </td>
                    <td className="py-4 px-4 space-y-0.5">
                      <p className="font-semibold text-[#171717]">
                        {order.customer_first_name} {order.customer_last_name}
                      </p>
                      <p className="text-[11px] text-[#737373]">{order.customer_email}</p>
                    </td>
                    <td className="py-4 px-4 font-serif font-medium text-[#171717]">
                      {order.artwork?.title_fr || order.artwork_id}
                    </td>
                    <td className="py-4 px-4 font-bold text-[#171717]">
                      {order.amount.toLocaleString()} {order.currency}
                    </td>
                    <td className="py-4 px-4 text-[#737373]">
                      {order.payment_method?.name || 'Virement'}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={order.status} type="order" locale={locale} size="sm" />
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3.5 py-1.5 rounded-full bg-[#171717] text-white font-semibold hover:bg-[#EF5A33] transition-colors"
                      >
                        {t.admin.ordersList.viewDetails}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      
    </>
  );
};
