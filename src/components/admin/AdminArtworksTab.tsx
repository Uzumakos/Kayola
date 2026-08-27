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

export const AdminArtworksTab: React.FC<any> = (props) => {
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
                Gestion des Œuvres d'Art ({artworks.length})
              </h3>
              <p className="text-xs text-[#737373]">
                Ajoutez, modifiez les fiches techniques, prix et statut de vente.
              </p>
            </div>

            <button
              onClick={() => {
                setArtworkImageLoadError(false);
                setEditingArtwork({
                  item_code: `ART-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
                  title_fr: '',
                  title_en: '',
                  artist: '',
                  price: 2500,
                  currency: 'USD',
                  category_id: categories[0]?.id || 'cat-1',
                  year: 2026,
                  width_cm: 100,
                  height_cm: 80,
                  depth_cm: 4,
                  status: 'AVAILABLE',
                  is_framed: true,
                  has_certificate: true,
                  featured: false,
                  images: [
                    {
                      id: `img-${Date.now()}`,
                      artwork_id: '',
                      url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85',
                      alt_text_fr: 'Vue principale',
                      alt_text_en: 'Primary view',
                      sort_order: 1,
                      is_primary: true,
                    },
                  ],
                });
                setArtworkModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EF5A33] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#D94725] transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{t.admin.artworkModal.createTitle}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artworks.map((art) => (
              <div
                key={art.id}
                className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E2] flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <img
                    src={art.images[0]?.url}
                    alt={art.title_fr}
                    className="w-full aspect-4/3 object-cover rounded-xl border border-[#E8E6E2]"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#EF5A33]">
                      {art.artist}
                    </span>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#E8E6E2] text-[#171717]">
                      {art.item_code || 'ART-2026-001'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-base text-[#171717] line-clamp-1">
                      {art.title_fr}
                    </h4>
                    <StatusBadge status={art.status} type="artwork" locale={locale} size="sm" />
                  </div>
                  <p className="text-xs font-bold text-[#171717]">
                    {art.price.toLocaleString()} {art.currency}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E8E6E2] flex items-center justify-between">
                  <button
                    onClick={() => {
                      setArtworkImageLoadError(false);
                      setEditingArtwork({
                        ...art,
                        images: art.images?.length
                          ? [...art.images]
                          : [
                              {
                                id: `img-${Date.now()}`,
                                artwork_id: art.id,
                                url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85',
                                alt_text_fr: 'Vue principale',
                                alt_text_en: 'Primary view',
                                sort_order: 1,
                                is_primary: true,
                              },
                            ],
                      });
                      setArtworkModalOpen(true);
                    }}
                    className="p-2 text-[#737373] hover:text-[#171717] hover:bg-white rounded-lg flex items-center gap-1 text-xs font-semibold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(t.admin.artworkModal.deleteConfirm)) {
                        store.deleteArtwork(art.id);
                        toast('Œuvre supprimée', 'info');
                      }
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      
    </>
  );
};
