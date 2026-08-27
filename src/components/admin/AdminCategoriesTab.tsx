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

export const AdminCategoriesTab: React.FC<any> = (props) => {
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
                  {t.admin.categories}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FAF9F6] border border-[#E8E6E2] text-xs font-semibold text-[#737373]">
                  {categories.length}
                </span>
              </div>
              <p className="text-xs text-[#737373] mt-1">
                Créez, modifiez ou supprimez les collections et médiums artistiques qui structurent la galerie.
              </p>
            </div>

            <button
              onClick={handleOpenAddCategory}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EF5A33] text-white text-xs font-semibold hover:bg-[#D94725] transition-colors shadow-xs shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{t.admin.categoryModal?.createTitle || 'Ajouter une catégorie'}</span>
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-[#FAF9F6] rounded-2xl border border-dashed border-[#E8E6E2]">
              <FolderKanban className="w-8 h-8 text-[#737373] mx-auto opacity-50" />
              <p className="text-sm font-semibold text-[#171717]">Aucune catégorie créée</p>
              <p className="text-xs text-[#737373]">Cliquez sur le bouton ci-dessus pour ajouter votre première collection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const artworkCount = artworks.filter((a) => a.category_id === cat.id).length;
                return (
                  <div key={cat.id} className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E2] flex flex-col justify-between space-y-4 hover:border-[#171717]/30 transition-all shadow-2xs">
                    <div className="space-y-3">
                      <div className="relative w-full h-36 rounded-xl overflow-hidden bg-white border border-[#E8E6E2]">
                        <img
                          src={cat.image_url || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80'}
                          alt={cat.name_fr}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono font-bold">
                          {artworkCount} {artworkCount > 1 ? 'œuvres' : 'œuvre'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif font-bold text-base text-[#171717]">{cat.name_fr}</h4>
                          <span className="text-[10px] font-mono text-[#737373] bg-white px-2 py-0.5 rounded-md border border-[#E8E6E2]">
                            /{cat.slug}
                          </span>
                        </div>
                        {cat.name_en && (
                          <p className="text-xs text-[#737373] italic">{cat.name_en}</p>
                        )}
                        <p className="text-xs text-[#737373] line-clamp-2 leading-relaxed">
                          {locale === 'en' ? (cat.description_en || cat.description_fr) : (cat.description_fr || cat.description_en)}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E8E6E2] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleEditCategory(cat)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#171717] bg-white border border-[#E8E6E2] hover:bg-[#FAF9F6] flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#EF5A33]" />
                        <span>Modifier</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id, cat.name_fr)}
                        className="p-1.5 text-[#737373] hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs transition-colors"
                        title="Supprimer la collection"
                      >
                        <Trash2 className="w-4 h-4" />
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
