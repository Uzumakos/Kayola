import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { store } from '../lib/store';
import { Artwork, Category, Order, PaymentMethod, PaymentProof, GallerySettings, ContactMessage } from '../types';
import { fetchAllContactMessages, markContactMessageAsRead } from '../lib/supabase';
import { StatusBadge } from '../components/ui/StatusBadge';
import { KayolaLogo } from '../components/layout/KayolaLogo';
import { AdminMessagesTab } from '../components/admin/AdminMessagesTab';
import {
  LayoutDashboard,
  Palette,
  FolderKanban,
  CreditCard,
  ShoppingBag,
  Settings,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Eye,
  Copy,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  FileText,
  DollarSign,
  Search,
  ExternalLink,
  ChevronRight,
  Building2,
  Smartphone,
  Globe,
  Image as ImageIcon,
  Link2,
  Sparkles,
  Barcode,
  Hash,
  QrCode,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PRESET_PAYMENT_LOGOS = [
  { name: 'MonCash', url: 'https://images.unsplash.com/photo-1556742049-0a67e5572263?auto=format&fit=crop&w=300&q=80', label: 'MonCash (Digicel)' },
  { name: 'NatCash', url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=300&q=80', label: 'NatCash (Natcom)' },
  { name: 'Sogebank', url: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=300&q=80', label: 'Sogebank' },
  { name: 'Unibank', url: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=300&q=80', label: 'Unibank' },
  { name: 'Wire / SWIFT', url: 'https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?auto=format&fit=crop&w=300&q=80', label: 'SWIFT Wire' },
  { name: 'Cards / Stripe', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=300&q=80', label: 'Stripe / Cards' },
  { name: 'Zelle / US Bank', url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=300&q=80', label: 'Zelle / Bank' },
];

const PRESET_ARTWORK_IMAGES = [
  { label: 'Esprits Solaires (Peinture)', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Vibrations Caraïbes (Toile)', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Récifs & Métaux (Sculpture)', url: 'https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Harmonie Tropicale (Acrylique)', url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Port-au-Prince Nocturne', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Crépuscule Jacmel (Huile)', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=85' },
];

const PRESET_CATEGORY_IMAGES = [
  { label: 'Peinture Classique / Florale', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Sculpture & Matière', url: 'https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Photographie Urbaine', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Art Numérique & Abstraction', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Pigments & Toiles Mixtes', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Installation & Volume', url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80' },
];

const PRESET_GALLERY_LOGOS = [
  { label: 'Monogramme Solaire Or & Ivoire', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80' },
  { label: 'Sceau Contemporain Terracotta', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80' },
  { label: 'Emblème Minéral Outremer', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80' },
  { label: 'Blason Sculpteur Ébène', url: 'https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?auto=format&fit=crop&w=400&q=80' },
];

export const AdminDashboardPage: React.FC = () => {
  const { locale, t, navigate, openLightbox, toast } = useApp();

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(store.isAdmin());
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'artworks' | 'categories' | 'payment_methods' | 'settings' | 'messages'>('dashboard');

  // Data States
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);

  // Gallery Settings & Logo State
  const [settings, setSettings] = useState<GallerySettings>(() => store.getSettings());
  const [logoUrlInput, setLogoUrlInput] = useState(() => store.getSettings().logo_url || '');
  const [galleryNameInput, setGalleryNameInput] = useState(() => store.getSettings().gallery_name || 'KAYOLA');
  const [taglineFrInput, setTaglineFrInput] = useState(() => store.getSettings().tagline_fr || 'Art Contemporain');
  const [taglineEnInput, setTaglineEnInput] = useState(() => store.getSettings().tagline_en || 'Contemporary Art');
  const [contactEmailInput, setContactEmailInput] = useState(() => store.getSettings().contact_email || '');
  const [contactPhoneInput, setContactPhoneInput] = useState(() => store.getSettings().contact_phone || '');
  const [addressInput, setAddressInput] = useState(() => store.getSettings().address || '');
  const [aboutImagesInput, setAboutImagesInput] = useState<string[]>(() => store.getSettings().about_images || []);
  const [pickupAddressInput, setPickupAddressInput] = useState(() => store.getSettings().pickup_address || '');
  const [logoImageLoadError, setLogoImageLoadError] = useState(false);
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');

  // Selected Order for Detail View
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Selected Message
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Modals
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [confirmSaleModalOpen, setConfirmSaleModalOpen] = useState(false);

  // Artwork Form Modal
  const [artworkModalOpen, setArtworkModalOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Partial<Artwork> | null>(null);
  const [artworkImageLoadError, setArtworkImageLoadError] = useState(false);

  // Payment Method Form Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<Partial<PaymentMethod> | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Category Form Modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [categoryImageLoadError, setCategoryImageLoadError] = useState(false);

  // Filter for orders table
  const [orderFilter, setOrderFilter] = useState<'all' | 'review' | 'accepted' | 'sold' | 'rejected'>('all');

  useEffect(() => {
    const refresh = () => {
      setIsLoggedIn(store.isAdmin());
      setArtworks(store.getArtworks());
      setCategories(store.getCategories());
      setPaymentMethods(store.getPaymentMethods(false));
      setOrders(store.getOrders());
      const currentSettings = store.getSettings();
      setSettings(currentSettings);
      if (selectedOrder) {
        const updated = store.getOrderById(selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    };
    refresh();
    const unsubscribe = store.subscribe(refresh);
    return unsubscribe;
  }, [selectedOrder?.id]);

  useEffect(() => {
    if (activeTab === 'messages' && isLoggedIn) {
      fetchAllContactMessages().then(setContactMessages);
    }
  }, [activeTab, isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const isSetup = !store.getSettings().admin_email;

    let ok = false;
    if (isSetup) {
      ok = await store.setupAdminCredentials(loginEmail, loginPassword);
      if (ok) toast('Identifiants administrateur configurés avec succès !', 'success');
    } else {
      ok = await store.adminLogin(loginEmail, loginPassword);
      if (ok) toast('Connexion administrateur réussie', 'success');
    }

    if (ok) {
      setIsLoggedIn(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      if (!isSetup) toast('Identifiants incorrects', 'error');
    }
  };

  const handleLogout = () => {
    store.adminLogout();
    setIsLoggedIn(false);
    navigate(`/${locale}`);
  };

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast(`${label} copié : ${text}`, 'info');
    }
  };

  // Order Actions
  const handleAcceptPayment = (orderId: string) => {
    const ok = store.acceptPayment(orderId);
    if (ok) {
      toast('Paiement accepté avec succès. Vous pouvez contacter le client.', 'success');
    }
  };

  const handleRejectPayment = () => {
    if (!selectedOrder || !rejectionReason.trim()) {
      toast('Veuillez indiquer un motif de refus.', 'error');
      return;
    }
    const ok = store.rejectPayment(selectedOrder.id, rejectionReason.trim());
    if (ok) {
      setRejectModalOpen(false);
      setRejectionReason('');
      toast('Preuve de paiement rejetée.', 'info');
    }
  };

  const handleConfirmSale = () => {
    if (!selectedOrder) return;
    const ok = store.confirmSale(selectedOrder.id);
    if (ok) {
      setConfirmSaleModalOpen(false);
      toast('Vente officiellement confirmée ! L’œuvre est marquée VENDUE.', 'success');
    }
  };

  // Artwork Save
  const handleSaveArtwork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtwork) return;

    const currentImageUrl =
      editingArtwork.images?.[0]?.url?.trim() ||
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85';

    const newArt: Artwork = {
      id: editingArtwork.id || `art-${Date.now()}`,
      item_code:
        editingArtwork.item_code?.trim().toUpperCase() ||
        `ART-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      slug:
        editingArtwork.slug ||
        (editingArtwork.title_fr || 'oeuvre')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      title_fr: editingArtwork.title_fr || 'Sans titre',
      title_en: editingArtwork.title_en || editingArtwork.title_fr || 'Untitled',
      artist: editingArtwork.artist || 'Artiste KAYOLA',
      artist_bio_fr: editingArtwork.artist_bio_fr || '',
      artist_bio_en: editingArtwork.artist_bio_en || '',
      description_fr: editingArtwork.description_fr || '',
      description_en: editingArtwork.description_en || '',
      price: Number(editingArtwork.price) || 1000,
      currency: editingArtwork.currency || 'USD',
      category_id: editingArtwork.category_id || categories[0]?.id || 'cat-1',
      technique_fr: editingArtwork.technique_fr || 'Technique mixte',
      technique_en: editingArtwork.technique_en || 'Mixed media',
      materials_fr: editingArtwork.materials_fr || 'Toile',
      materials_en: editingArtwork.materials_en || 'Canvas',
      year: Number(editingArtwork.year) || 2026,
      width_cm: Number(editingArtwork.width_cm) || 80,
      height_cm: Number(editingArtwork.height_cm) || 80,
      depth_cm: Number(editingArtwork.depth_cm) || 3,
      is_framed: Boolean(editingArtwork.is_framed),
      has_certificate: Boolean(editingArtwork.has_certificate ?? true),
      featured: Boolean(editingArtwork.featured),
      status: editingArtwork.status || 'AVAILABLE',
      images: [
        {
          id: editingArtwork.images?.[0]?.id || `img-${Date.now()}`,
          artwork_id: editingArtwork.id || `art-${Date.now()}`,
          url: currentImageUrl,
          alt_text_fr: editingArtwork.title_fr || 'Vue principale',
          alt_text_en: editingArtwork.title_en || 'Primary view',
          sort_order: 1,
          is_primary: true,
        },
        ...(editingArtwork.images?.slice(1) || []),
      ],
      created_at: editingArtwork.created_at || new Date().toISOString(),
    };

    store.saveArtwork(newArt);
    setArtworkModalOpen(false);
    setEditingArtwork(null);
    toast('Œuvre enregistrée dans la base de données.', 'success');
  };

  // --- PAYMENT METHOD MANAGEMENT ---
  const handleOpenAddPaymentMethod = () => {
    setImageLoadError(false);
    setEditingPaymentMethod({
      id: `pay-${Date.now()}`,
      name: '',
      type: 'bank_transfer',
      description_fr: '',
      description_en: '',
      instructions_fr: '',
      instructions_en: '',
      account_name: 'GALERIE KAYOLA S.A.',
      account_number: '',
      phone_number: '',
      additional_information_fr: '',
      additional_information_en: '',
      logo_url: '',
      is_active: true,
    });
    setPaymentModalOpen(true);
  };

  const handleEditPaymentMethod = (method: PaymentMethod) => {
    setImageLoadError(false);
    setEditingPaymentMethod({ ...method });
    setPaymentModalOpen(true);
  };

  const handleDeletePaymentMethod = (id: string, name: string) => {
    if (window.confirm(t.admin.paymentModal?.deleteConfirm || `Voulez-vous vraiment supprimer "${name}" ?`)) {
      store.deletePaymentMethod(id);
      toast('Moyen de paiement supprimé.', 'info');
    }
  };

  const handleTogglePaymentMethod = (id: string) => {
    store.togglePaymentMethodStatus(id);
    toast('Statut du moyen de paiement mis à jour.', 'success');
  };

  const handleSavePaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPaymentMethod?.name || !editingPaymentMethod?.account_name || !editingPaymentMethod?.account_number) {
      toast('Veuillez remplir au moins le nom, le bénéficiaire et le numéro de compte.', 'error');
      return;
    }

    const methodToSave: PaymentMethod = {
      id: editingPaymentMethod.id || `pay-${Date.now()}`,
      name: editingPaymentMethod.name.trim(),
      type: editingPaymentMethod.type || 'bank_transfer',
      description_fr: editingPaymentMethod.description_fr || '',
      description_en: editingPaymentMethod.description_en || editingPaymentMethod.description_fr || '',
      instructions_fr: editingPaymentMethod.instructions_fr || '',
      instructions_en: editingPaymentMethod.instructions_en || editingPaymentMethod.instructions_fr || '',
      account_name: editingPaymentMethod.account_name.trim(),
      account_number: editingPaymentMethod.account_number.trim(),
      phone_number: editingPaymentMethod.phone_number?.trim() || undefined,
      additional_information_fr: editingPaymentMethod.additional_information_fr?.trim() || undefined,
      additional_information_en: editingPaymentMethod.additional_information_en?.trim() || undefined,
      logo_url: editingPaymentMethod.logo_url?.trim() || undefined,
      is_active: Boolean(editingPaymentMethod.is_active ?? true),
      created_at: editingPaymentMethod.created_at || new Date().toISOString(),
    };

    store.savePaymentMethod(methodToSave);
    setPaymentModalOpen(false);
    setEditingPaymentMethod(null);
    toast('Moyen de paiement enregistré avec succès.', 'success');
  };

  // --- CATEGORY / COLLECTION MANAGEMENT ---
  const handleOpenAddCategory = () => {
    setCategoryImageLoadError(false);
    setEditingCategory({
      id: `cat-${Date.now()}`,
      slug: '',
      name_fr: '',
      name_en: '',
      description_fr: '',
      description_en: '',
      image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    });
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (cat: Category) => {
    setCategoryImageLoadError(false);
    setEditingCategory({ ...cat });
    setCategoryModalOpen(true);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    const artworkCount = artworks.filter((a) => a.category_id === id).length;
    const confirmMsg = artworkCount > 0
      ? `Cette catégorie contient ${artworkCount} œuvre(s). Voulez-vous vraiment supprimer "${name}" ? (Les œuvres conserveront leur référence)`
      : (t.admin.categoryModal?.deleteConfirm || `Voulez-vous vraiment supprimer la catégorie "${name}" ?`);

    if (window.confirm(confirmMsg)) {
      store.deleteCategory(id);
      toast('Catégorie / Collection supprimée.', 'info');
    }
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name_fr?.trim()) {
      toast('Veuillez renseigner au moins le nom en français de la catégorie.', 'error');
      return;
    }

    const generatedSlug = (editingCategory.slug?.trim() || editingCategory.name_fr.trim())
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const categoryToSave: Category = {
      id: editingCategory.id || `cat-${Date.now()}`,
      slug: generatedSlug || `category-${Date.now()}`,
      name_fr: editingCategory.name_fr.trim(),
      name_en: editingCategory.name_en?.trim() || editingCategory.name_fr.trim(),
      description_fr: editingCategory.description_fr?.trim() || '',
      description_en: editingCategory.description_en?.trim() || editingCategory.description_fr?.trim() || '',
      image_url:
        editingCategory.image_url?.trim() ||
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    };

    store.saveCategory(categoryToSave);
    setCategoryModalOpen(false);
    setEditingCategory(null);
    toast('Collection / Catégorie enregistrée avec succès.', 'success');
  };

  // --- GALLERY SETTINGS & LOGO MANAGEMENT ---
  const handleSaveGallerySettings = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = logoUrlInput.trim();
    const updated = store.saveSettings({
      logo_url: cleanUrl,
      logo_type: cleanUrl ? 'image' : 'monogram',
      gallery_name: galleryNameInput.trim() || 'KAYOLA',
      tagline_fr: taglineFrInput.trim() || 'Art Contemporain',
      tagline_en: taglineEnInput.trim() || 'Contemporary Art',
      contact_email: contactEmailInput.trim(),
      contact_phone: contactPhoneInput.trim(),
      address: addressInput.trim(),
      about_images: aboutImagesInput.map(url => url.trim()).filter(Boolean),
    });
    setSettings(updated);
    toast('Identité et logo de la galerie mis à jour avec succès.', 'success');
  };

  const handleResetToDefaultLogo = () => {
    const updated = store.resetLogo();
    setSettings(updated);
    setLogoUrlInput('');
    setLogoImageLoadError(false);
    toast('Logo réinitialisé au monogramme officiel KAYOLA.', 'info');
  };

  // --- STATS COMPUTATION ---
  const totalArtworks = artworks.length;
  const availableArtworks = artworks.filter((a) => a.status === 'AVAILABLE').length;
  const reservedArtworks = artworks.filter((a) => a.status === 'RESERVED' || a.status === 'PAYMENT_REVIEW').length;
  const paymentsToReview = orders.filter((o) => o.status === 'PAYMENT_REVIEW' || o.status === 'PAYMENT_PROOF_SUBMITTED').length;
  const totalOrders = orders.length;
  const soldArtworks = artworks.filter((a) => a.status === 'SOLD').length;
  const totalRevenue = orders
    .filter((o) => o.status === 'SOLD')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'review') return o.status === 'PAYMENT_REVIEW' || o.status === 'PAYMENT_PROOF_SUBMITTED';
    if (orderFilter === 'accepted') return o.status === 'PAYMENT_ACCEPTED';
    if (orderFilter === 'sold') return o.status === 'SOLD';
    if (orderFilter === 'rejected') return o.status === 'PAYMENT_REJECTED';
    return true;
  });

  // --- 1. ADMIN LOGIN VIEW ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E8E6E2] shadow-xl max-w-md w-full space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#EF5A33]/10 text-[#EF5A33] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#171717]">
              {!store.getSettings().admin_email ? 'Configuration Administrateur' : t.admin.loginTitle}
            </h2>
            <p className="text-xs text-[#737373]">
              {!store.getSettings().admin_email
                ? 'Configurez votre email et mot de passe pour sécuriser l\'accès.'
                : t.admin.loginSubtitle}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#171717] block">
                {t.admin.emailLabel || 'Email Administrateur'}
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@kayola-art.com"
                className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl text-sm focus:outline-hidden focus:border-[#EF5A33]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#171717] block">
                {t.admin.passwordLabel || 'Mot de passe'}
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl text-sm font-mono focus:outline-hidden focus:border-[#EF5A33]"
              />
            </div>

            {loginError && store.getSettings().admin_email && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                Identifiants incorrects. Veuillez réessayer.
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-full bg-[#EF5A33] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#D94725] transition-all shadow-md"
            >
              {!store.getSettings().admin_email ? 'Configurer l\'accès' : t.admin.loginBtn}
            </button>
          </form>

          {/* <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E8E6E2] text-center text-xs text-[#737373]">
            <p>Accès Démo : Mot de passe <strong>admin123</strong></p>
          </div> */}
        </motion.div>
      </div>
    );
  }

  // --- 2. ADMIN DASHBOARD VIEW ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Admin Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8E6E2]">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full bg-[#EF5A33]/10 text-[#EF5A33] text-xs font-bold uppercase tracking-wider">
              Administration Galerie
            </span>
            <span className="text-xs text-[#737373]">Direction & Curation</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#171717]">
            {t.admin.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/${locale}`)}
            className="px-4 py-2 rounded-full border border-[#E8E6E2] text-xs font-semibold text-[#171717] hover:bg-white flex items-center gap-1.5"
          >
            <span>Voir le site public</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#737373]" />
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full bg-[#171717] text-white text-xs font-semibold hover:bg-black flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.admin.logoutBtn}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeTab === 'dashboard'
            ? 'bg-[#EF5A33] text-white shadow-xs'
            : 'bg-white text-[#171717] border border-[#E8E6E2] hover:border-[#171717]'
            }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>{t.admin.dashboard}</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeTab === 'orders'
            ? 'bg-[#EF5A33] text-white shadow-xs'
            : 'bg-white text-[#171717] border border-[#E8E6E2] hover:border-[#171717]'
            }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t.admin.orders}</span>
          {paymentsToReview > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-[#EF5A33] font-extrabold text-[10px] flex items-center justify-center shadow-xs">
              {paymentsToReview}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('artworks')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeTab === 'artworks'
            ? 'bg-[#EF5A33] text-white shadow-xs'
            : 'bg-white text-[#171717] border border-[#E8E6E2] hover:border-[#171717]'
            }`}
        >
          <Palette className="w-4 h-4" />
          <span>{t.admin.artworks} ({artworks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeTab === 'categories'
            ? 'bg-[#EF5A33] text-white shadow-xs'
            : 'bg-white text-[#171717] border border-[#E8E6E2] hover:border-[#171717]'
            }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>{t.admin.categories}</span>
        </button>

        <button
          onClick={() => setActiveTab('payment_methods')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeTab === 'payment_methods'
            ? 'bg-[#EF5A33] text-white shadow-xs'
            : 'bg-white text-[#171717] border border-[#E8E6E2] hover:border-[#171717]'
            }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{t.admin.paymentMethods}</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeTab === 'messages'
            ? 'bg-[#EF5A33] text-white shadow-xs'
            : 'bg-white text-[#171717] border border-[#E8E6E2] hover:border-[#171717]'
            }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Messages</span>
          {contactMessages.filter(m => m.status === 'unread').length > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-[#EF5A33] font-extrabold text-[10px] flex items-center justify-center shadow-xs">
              {contactMessages.filter(m => m.status === 'unread').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeTab === 'settings'
            ? 'bg-[#EF5A33] text-white shadow-xs'
            : 'bg-white text-[#171717] border border-[#E8E6E2] hover:border-[#171717]'
            }`}
        >
          <Settings className="w-4 h-4" />
          <span>{t.admin.settings} & Logo</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && (
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
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
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
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${orderFilter === 'all' ? 'bg-[#171717] text-white' : 'bg-[#FAF9F6] text-[#737373]'
                  }`}
              >
                {t.admin.ordersList.filterAll} ({orders.length})
              </button>
              <button
                onClick={() => setOrderFilter('review')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${orderFilter === 'review' ? 'bg-[#EF5A33] text-white' : 'bg-[#FAF9F6] text-[#737373]'
                  }`}
              >
                {t.admin.ordersList.filterReview}
              </button>
              <button
                onClick={() => setOrderFilter('accepted')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${orderFilter === 'accepted' ? 'bg-emerald-600 text-white' : 'bg-[#FAF9F6] text-[#737373]'
                  }`}
              >
                {t.admin.ordersList.filterAccepted}
              </button>
              <button
                onClick={() => setOrderFilter('sold')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${orderFilter === 'sold' ? 'bg-black text-[#EF5A33]' : 'bg-[#FAF9F6] text-[#737373]'
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
      )}

      {/* TAB 3: ARTWORKS CRUD */}
      {activeTab === 'artworks' && (
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

                  <div className="flex items-center gap-2">
                    {art.status !== 'AVAILABLE' && (
                      <button
                        onClick={() => {
                          if (window.confirm("Êtes-vous sûr de vouloir restaurer cette œuvre et annuler la commande associée ?")) {
                            store.updateArtworkStatus(art.id, 'AVAILABLE');
                            const relatedOrder = store.getOrders().find(o => o.artwork_id === art.id && o.status !== 'CANCELLED');
                            if (relatedOrder) {
                              store.cancelOrder(relatedOrder.id, "Annulée suite à la restauration de l'œuvre (Admin).");
                            }
                            toast('Œuvre restaurée et commande annulée', 'success');
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-bold transition-colors"
                        title="Restaurer l'œuvre (Annule la commande)"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restaurer</span>
                      </button>
                    )}
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIES CRUD */}
      {activeTab === 'categories' && (
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
      )}

      {/* TAB 5: PAYMENT METHODS CRUD */}
      {activeTab === 'payment_methods' && (
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

          <div className="bg-[#FAF9F6] p-5 sm:p-6 rounded-2xl border border-[#E8E6E2] space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-[#EF5A33] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-serif font-bold text-[#171717] text-base">Point de Retrait (Pickup)</h4>
                <p className="text-xs text-[#737373] mt-1">Adresse à laquelle les clients viendront récupérer leurs œuvres d'art.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={pickupAddressInput}
                onChange={(e) => setPickupAddressInput(e.target.value)}
                placeholder="Ex: Galerie KAYOLA, 12 Rue des Arts..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#E8E6E2] focus:outline-hidden focus:border-[#EF5A33] text-sm bg-white"
              />
              <button
                onClick={() => {
                  setSettings(store.saveSettings({ pickup_address: pickupAddressInput.trim() }));
                  toast('Adresse de retrait mise à jour.', 'success');
                }}
                className="px-5 py-2.5 bg-white border border-[#E8E6E2] hover:bg-[#FAF9F6] rounded-xl text-xs font-semibold text-[#171717] transition-colors shrink-0"
              >
                Enregistrer l'adresse
              </button>
            </div>
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
                    className={`p-6 bg-[#FAF9F6] rounded-3xl border transition-all space-y-5 flex flex-col justify-between ${method.is_active ? 'border-[#E8E6E2] shadow-xs' : 'border-gray-200 opacity-75'
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
                              {locale === 'en' ? method.description_en : method.description_fr}
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
                            {locale === 'en' ? method.instructions_en : method.instructions_fr}
                          </p>
                        </div>

                        {(method.additional_information_fr || method.additional_information_en) && (
                          <div className="pt-1 border-t border-[#E8E6E2]/60">
                            <span className="text-[10px] text-[#737373] block font-mono">Détails Swift / Agence :</span>
                            <p className="text-[11px] text-[#737373]/90 italic">
                              {locale === 'en' ? method.additional_information_en : method.additional_information_fr}
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
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${method.is_active
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
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${method.is_active
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
      )}

      {/* TAB: MESSAGES */}
      {activeTab === 'messages' && (
        <AdminMessagesTab
          messages={contactMessages}
          onMessagesChange={() => fetchAllContactMessages().then(setContactMessages)}
        />
      )}

      {/* TAB 6: SETTINGS & LOGO IDENTITY */}
      {activeTab === 'settings' && (
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
                        className={`flex items-center gap-2.5 p-2 rounded-xl border text-left text-xs transition-all ${logoUrlInput === preset.url
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

                {/* Images de la page À Propos */}
                <div className="space-y-4 pt-4 border-t border-[#E8E6E2]">
                  <div className="flex items-center justify-between">
                    <h5 className="font-serif font-bold text-sm text-[#171717]">
                      Images du slider "À Propos"
                    </h5>
                    <button
                      type="button"
                      onClick={() => setAboutImagesInput([...aboutImagesInput, ''])}
                      className="text-xs text-[#EF5A33] font-bold uppercase tracking-wider hover:underline"
                    >
                      + Ajouter une image
                    </button>
                  </div>

                  {aboutImagesInput.length === 0 ? (
                    <p className="text-xs text-[#737373]">Aucune image. Une image par défaut sera utilisée.</p>
                  ) : (
                    <div className="space-y-3">
                      {aboutImagesInput.map((url, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={url}
                            onChange={(e) => {
                              const newArr = [...aboutImagesInput];
                              newArr[index] = e.target.value;
                              setAboutImagesInput(newArr);
                            }}
                            placeholder="https://..."
                            className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E2] text-sm text-[#171717] focus:outline-hidden focus:border-[#171717]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newArr = aboutImagesInput.filter((_, i) => i !== index);
                              setAboutImagesInput(newArr);
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                        value={contactEmailInput}
                        onChange={(e) => setContactEmailInput(e.target.value)}
                        placeholder="franklinfabiola17@gmail.com"
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E2] text-sm text-[#171717] focus:outline-hidden focus:border-[#171717]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#737373]">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={contactPhoneInput}
                        onChange={(e) => setContactPhoneInput(e.target.value)}
                        placeholder="+509 40 14 86 09"
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
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
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
            </div>

            {/* Right: Live Preview Box (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
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
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${previewMode === 'light'
                        ? 'bg-white text-[#171717] shadow-2xs font-semibold'
                        : 'text-[#737373] hover:text-[#171717]'
                        }`}
                    >
                      En-tête (Clair)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('dark')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${previewMode === 'dark'
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
                  className={`p-6 rounded-2xl border transition-all flex flex-col items-center justify-center min-h-[180px] space-y-4 text-center ${previewMode === 'dark'
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
                          className={`font-black tracking-tighter uppercase text-xl ${previewMode === 'dark' ? 'text-white' : 'text-[#171717]'
                            }`}
                        >
                          {galleryNameInput || 'KAYOLA'}
                        </span>
                        <span
                          className={`text-[9px] uppercase tracking-[0.25em] font-medium -mt-1 ${previewMode === 'dark' ? 'text-white/60' : 'text-[#171717]/50'
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
                          className={`font-black tracking-tighter uppercase text-xl ${previewMode === 'dark' ? 'text-white' : 'text-[#171717]'
                            }`}
                        >
                          {galleryNameInput || 'KAYOLA'}
                        </span>
                        <span
                          className={`text-[9px] uppercase tracking-[0.25em] font-medium -mt-1 ${previewMode === 'dark' ? 'text-white/60' : 'text-[#171717]/50'
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
      )}

      {/* DETAIL DRAWER / MODAL FOR SELECTED ORDER */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-8 border border-[#E8E6E2] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E8E6E2] pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xl font-extrabold text-[#171717]">
                      {selectedOrder.order_number}
                    </span>
                    <StatusBadge status={selectedOrder.status} type="order" locale={locale} />
                  </div>
                  <p className="text-xs text-[#737373] mt-1">
                    Code d'accès client : <strong className="font-mono">{selectedOrder.access_code}</strong>
                  </p>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-[#737373] hover:text-[#171717] rounded-full hover:bg-[#FAF9F6]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Customer Contact & Copy Actions */}
              <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E2] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-base text-[#171717]">
                    {t.admin.orderDetail.customerSection}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(selectedOrder.customer_email, 'E-mail')}
                      className="px-3 py-1.5 rounded-full bg-white border border-[#E8E6E2] text-xs font-semibold text-[#171717] hover:bg-[#171717] hover:text-white transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t.admin.orderDetail.copyEmail}</span>
                    </button>
                    <button
                      onClick={() => handleCopy(selectedOrder.customer_phone, 'Téléphone')}
                      className="px-3 py-1.5 rounded-full bg-white border border-[#E8E6E2] text-xs font-semibold text-[#171717] hover:bg-[#171717] hover:text-white transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t.admin.orderDetail.copyPhone}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[#737373] block">Nom complet</span>
                    <span className="font-semibold text-[#171717]">
                      {selectedOrder.customer_first_name} {selectedOrder.customer_last_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#737373] block">E-mail</span>
                    <span className="font-semibold text-[#171717]">
                      {selectedOrder.customer_email}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#737373] block">Téléphone</span>
                    <span className="font-semibold text-[#171717]">
                      {selectedOrder.customer_phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#737373] block">Ville / Pays</span>
                    <span className="font-semibold text-[#171717]">
                      {selectedOrder.customer_city}, {selectedOrder.customer_country}
                    </span>
                  </div>
                </div>

                {selectedOrder.status === 'PAYMENT_ACCEPTED' && (
                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t.admin.orderDetail.manualContactReminder}</span>
                  </div>
                )}
              </div>

              {/* Payment Proof Viewer */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-base text-[#171717]">
                  {t.admin.orderDetail.proofSection}
                </h4>

                {selectedOrder.payment_proofs.length === 0 ? (
                  <p className="text-xs text-[#737373] italic">
                    {t.admin.orderDetail.noProof}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedOrder.payment_proofs.map((proof) => (
                      <div
                        key={proof.id}
                        className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E2] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-6 h-6 text-[#EF5A33]" />
                          <div>
                            <p className="text-xs font-bold text-[#171717]">{proof.file_name}</p>
                            <p className="text-[11px] text-[#737373]">
                              Téléversé le {new Date(proof.uploaded_at).toLocaleString()} • Statut :{' '}
                              <strong>{proof.status}</strong>
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => openLightbox(proof.file_data_url)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#E8E6E2] text-xs font-semibold text-[#171717] hover:border-[#EF5A33] hover:text-[#EF5A33] shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t.admin.orderDetail.viewProofFile}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Admin Action Buttons */}
              <div className="pt-4 border-t border-[#E8E6E2] flex flex-wrap items-center justify-end gap-3">
                {selectedOrder.status !== 'SOLD' && selectedOrder.status !== 'PAYMENT_ACCEPTED' && (
                  <>
                    <button
                      onClick={() => setRejectModalOpen(true)}
                      className="px-6 py-3 rounded-full bg-rose-50 text-rose-800 font-semibold text-xs hover:bg-rose-100 transition-colors border border-rose-200"
                    >
                      {t.admin.orderDetail.rejectPaymentBtn}
                    </button>

                    <button
                      onClick={() => handleAcceptPayment(selectedOrder.id)}
                      className="px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors shadow-md"
                    >
                      {t.admin.orderDetail.acceptPaymentBtn}
                    </button>
                  </>
                )}

                {selectedOrder.status === 'PAYMENT_ACCEPTED' && (
                  <button
                    onClick={() => setConfirmSaleModalOpen(true)}
                    className="px-8 py-3.5 rounded-full bg-[#EF5A33] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#D94725] transition-all shadow-lg flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t.admin.orderDetail.confirmSaleBtn}</span>
                  </button>
                )}

                {selectedOrder.status === 'SOLD' && (
                  <span className="px-5 py-2.5 rounded-full bg-[#171717] text-[#EF5A33] text-xs font-bold uppercase tracking-wider">
                    ★ Vente Confirmée & Œuvre Vendue
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REJECT PAYMENT MODAL */}
      <AnimatePresence>
        {rejectModalOpen && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 border border-[#E8E6E2]">
              <h3 className="font-serif font-bold text-lg text-rose-900">
                {t.admin.orderDetail.rejectionModalTitle}
              </h3>
              <p className="text-xs text-[#737373]">
                Indiquez le motif précis pour le client afin qu'il puisse soumettre une nouvelle preuve.
              </p>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t.admin.orderDetail.rejectionReasonPlaceholder}
                className="w-full p-3 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl text-xs"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#737373]"
                >
                  Annuler
                </button>
                <button
                  onClick={handleRejectPayment}
                  className="px-5 py-2 rounded-full bg-rose-600 text-white text-xs font-semibold"
                >
                  Confirmer le rejet
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFIRM SALE MODAL */}
      <AnimatePresence>
        {confirmSaleModalOpen && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 border border-[#E8E6E2]">
              <div className="w-12 h-12 rounded-full bg-[#EF5A33]/10 text-[#EF5A33] flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-center text-[#171717]">
                {t.admin.orderDetail.confirmSaleModalTitle}
              </h3>
              <p className="text-xs text-[#737373] text-center leading-relaxed">
                {t.admin.orderDetail.confirmSaleModalDesc}
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setConfirmSaleModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#737373]"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmSale}
                  className="px-6 py-2.5 rounded-full bg-[#EF5A33] text-white text-xs font-semibold hover:bg-[#D94725]"
                >
                  Confirmer la vente (Marquer SOLD)
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ARTWORK EDIT/CREATE MODAL */}
      <AnimatePresence>
        {artworkModalOpen && editingArtwork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setArtworkModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 border border-[#E8E6E2]"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-serif font-bold text-xl text-[#171717]">
                {editingArtwork.id ? t.admin.artworkModal.editTitle : t.admin.artworkModal.createTitle}
              </h3>

              <form onSubmit={handleSaveArtwork} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">{t.admin.artworkModal.titleFr} *</label>
                    <input
                      type="text"
                      required
                      value={editingArtwork.title_fr || ''}
                      onChange={(e) => setEditingArtwork({ ...editingArtwork, title_fr: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">{t.admin.artworkModal.titleEn}</label>
                    <input
                      type="text"
                      value={editingArtwork.title_en || ''}
                      onChange={(e) => setEditingArtwork({ ...editingArtwork, title_en: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl"
                    />
                  </div>
                </div>

                {/* Code de l'article / Référence (SKU) — Placé juste après le titre */}
                <div className="p-3.5 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E2] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-xs text-[#171717] flex items-center gap-1.5">
                      <Barcode className="w-4 h-4 text-[#EF5A33]" />
                      <span>Code de l'article / Référence (SKU) *</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const code = `ART-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
                        setEditingArtwork({ ...editingArtwork, item_code: code });
                      }}
                      className="text-[11px] text-[#EF5A33] hover:underline font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Générer un code</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ART-2026-001, KAY-ECHO-03..."
                    value={editingArtwork.item_code || ''}
                    onChange={(e) => setEditingArtwork({ ...editingArtwork, item_code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-white border border-[#E8E6E2] rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-[#171717] focus:outline-hidden focus:border-[#EF5A33]"
                  />
                  <p className="text-[10px] text-[#737373]">
                    Ce code d'article est communiqué au client lors de sa réservation et permet le suivi de sa commande.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">{t.admin.artworkModal.artist} *</label>
                    <input
                      type="text"
                      required
                      value={editingArtwork.artist || ''}
                      onChange={(e) => setEditingArtwork({ ...editingArtwork, artist: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">{t.admin.artworkModal.price} *</label>
                    <input
                      type="number"
                      required
                      value={editingArtwork.price || 0}
                      onChange={(e) => setEditingArtwork({ ...editingArtwork, price: Number(e.target.value) })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">{t.admin.artworkModal.year}</label>
                    <input
                      type="number"
                      value={editingArtwork.year || 2026}
                      onChange={(e) => setEditingArtwork({ ...editingArtwork, year: Number(e.target.value) })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">{t.admin.artworkModal.category}</label>
                    <select
                      value={editingArtwork.category_id || categories[0]?.id || 'cat-1'}
                      onChange={(e) => setEditingArtwork({ ...editingArtwork, category_id: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {locale === 'en' ? cat.name_en : cat.name_fr}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Statut</label>
                    <select
                      value={editingArtwork.status || 'AVAILABLE'}
                      onChange={(e) => setEditingArtwork({ ...editingArtwork, status: e.target.value as any })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl"
                    >
                      <option value="AVAILABLE">AVAILABLE (Disponible)</option>
                      <option value="RESERVED">RESERVED (Réservée)</option>
                      <option value="PAYMENT_REVIEW">PAYMENT_REVIEW (En vérification)</option>
                      <option value="SOLD">SOLD (Vendue)</option>
                    </select>
                  </div>
                </div>

                {/* ARTWORK IMAGE URL / LINK INPUT WITH LIVE PREVIEW */}
                <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E2] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-xs text-[#171717] flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#EF5A33]" />
                      <span>{t.admin.artworkModal.imageUrl} *</span>
                    </label>
                    {editingArtwork.images?.[0]?.url && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(editingArtwork.images || [])];
                          if (updated[0]) updated[0].url = '';
                          setEditingArtwork({ ...editingArtwork, images: updated });
                          setArtworkImageLoadError(false);
                        }}
                        className="text-[11px] text-rose-600 hover:underline"
                      >
                        Effacer le lien
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/... (Lien direct vers l'image de l'œuvre)"
                      value={editingArtwork.images?.[0]?.url || ''}
                      onChange={(e) => {
                        const newUrl = e.target.value;
                        const updated = editingArtwork.images?.length
                          ? editingArtwork.images.map((img, i) => (i === 0 ? { ...img, url: newUrl } : img))
                          : [
                            {
                              id: `img-${Date.now()}`,
                              artwork_id: editingArtwork.id || '',
                              url: newUrl,
                              alt_text_fr: editingArtwork.title_fr || 'Vue principale',
                              alt_text_en: editingArtwork.title_en || 'Primary view',
                              sort_order: 1,
                              is_primary: true,
                            },
                          ];
                        setEditingArtwork({ ...editingArtwork, images: updated });
                        setArtworkImageLoadError(false);
                      }}
                      className="w-full p-2.5 pl-3 pr-8 bg-white border border-[#E8E6E2] rounded-xl text-xs font-mono"
                    />
                    <Link2 className="w-3.5 h-3.5 text-[#737373] absolute right-3 top-3 pointer-events-none" />
                  </div>

                  {/* Preset Artwork Images */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-[#737373] font-medium block">
                      Suggestions d'images d'art en haute définition (1-clic) :
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_ARTWORK_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const updated = editingArtwork.images?.length
                              ? editingArtwork.images.map((img, i) => (i === 0 ? { ...img, url: preset.url } : img))
                              : [
                                {
                                  id: `img-${Date.now()}`,
                                  artwork_id: editingArtwork.id || '',
                                  url: preset.url,
                                  alt_text_fr: editingArtwork.title_fr || 'Vue principale',
                                  alt_text_en: editingArtwork.title_en || 'Primary view',
                                  sort_order: 1,
                                  is_primary: true,
                                },
                              ];
                            setEditingArtwork({ ...editingArtwork, images: updated });
                            setArtworkImageLoadError(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E6E2] text-[10px] text-[#171717] hover:border-[#EF5A33] hover:text-[#EF5A33] transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Artwork Image Preview */}
                  <div className="pt-2 border-t border-[#E8E6E2]">
                    <span className="text-[11px] font-semibold text-[#737373] block mb-2">
                      Aperçu visuel de l'œuvre :
                    </span>
                    {editingArtwork.images?.[0]?.url && !artworkImageLoadError ? (
                      <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-[#E8E6E2]">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-[#FAF9F6] border border-[#E8E6E2] shrink-0">
                          <img
                            src={editingArtwork.images[0].url}
                            alt="Aperçu œuvre"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={() => setArtworkImageLoadError(true)}
                          />
                        </div>
                        <div className="space-y-1 text-xs">
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            ✓ Image valide et chargée
                          </span>
                          <p className="text-[11px] text-[#737373] line-clamp-2 font-mono">
                            {editingArtwork.images[0].url}
                          </p>
                          <p className="text-[11px] text-[#171717] font-medium">
                            Format : {editingArtwork.width_cm || 80} × {editingArtwork.height_cm || 80} cm
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-dashed border-[#E8E6E2] text-[#737373]">
                        <div className="w-12 h-12 rounded-lg bg-[#FAF9F6] flex items-center justify-center shrink-0">
                          <ImageIcon className="w-6 h-6 text-[#737373]/50" />
                        </div>
                        <span className="text-xs">
                          {artworkImageLoadError
                            ? "⚠️ Impossible de charger l'image depuis ce lien. Vérifiez l'URL."
                            : "Entrez une URL d'image valide ci-dessus pour afficher l'aperçu."}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">{t.admin.artworkModal.techniqueFr}</label>
                    <input
                      type="text"
                      value={editingArtwork.technique_fr || ''}
                      onChange={(e) => setEditingArtwork({ ...editingArtwork, technique_fr: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">{t.admin.artworkModal.materialsFr}</label>
                    <input
                      type="text"
                      value={editingArtwork.materials_fr || ''}
                      onChange={(e) => setEditingArtwork({ ...editingArtwork, materials_fr: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Largeur (cm)</label>
                    <input
                      type="number"
                      value={editingArtwork.width_cm || 80}
                      onChange={(e) => setEditingArtwork({ ...editingArtwork, width_cm: Number(e.target.value) })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Hauteur (cm)</label>
                    <input
                      type="number"
                      value={editingArtwork.height_cm || 80}
                      onChange={(e) => setEditingArtwork({ ...editingArtwork, height_cm: Number(e.target.value) })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">{t.admin.artworkModal.descriptionFr}</label>
                  <textarea
                    rows={3}
                    value={editingArtwork.description_fr || ''}
                    onChange={(e) => setEditingArtwork({ ...editingArtwork, description_fr: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingArtwork.featured)}
                      onChange={(e) => setEditingArtwork({ ...editingArtwork, featured: e.target.checked })}
                    />
                    <span>{t.admin.artworkModal.featured}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingArtwork.is_framed)}
                      onChange={(e) => setEditingArtwork({ ...editingArtwork, is_framed: e.target.checked })}
                    />
                    <span>{t.admin.artworkModal.isFramed}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingArtwork.has_certificate)}
                      onChange={(e) => setEditingArtwork({ ...editingArtwork, has_certificate: e.target.checked })}
                    />
                    <span>{t.admin.artworkModal.hasCertificate}</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-[#E8E6E2] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setArtworkModalOpen(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-[#737373]"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-full bg-[#EF5A33] text-white text-xs font-semibold hover:bg-[#D94725]"
                  >
                    {t.admin.artworkModal.saveBtn}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD / EDIT PAYMENT METHOD */}
      <AnimatePresence>
        {paymentModalOpen && editingPaymentMethod && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
            onClick={() => setPaymentModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 border border-[#E8E6E2] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#E8E6E2] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E2] flex items-center justify-center text-[#EF5A33]">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-xl text-[#171717]">
                      {editingPaymentMethod.id && store.getPaymentMethodById(editingPaymentMethod.id)
                        ? (t.admin.paymentModal?.editTitle || 'Modifier le Moyen de Paiement')
                        : (t.admin.paymentModal?.createTitle || 'Ajouter un Moyen de Paiement')}
                    </h3>
                    <p className="text-xs text-[#737373]">
                      Renseignez les coordonnées bancaires, le logo et les consignes pour les acheteurs.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setPaymentModalOpen(false)}
                  className="p-2 text-[#737373] hover:text-[#171717] rounded-full hover:bg-[#FAF9F6]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePaymentMethod} className="space-y-5 text-xs">
                {/* Method Name & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="font-semibold block mb-1 text-[#171717]">
                      {t.admin.paymentModal?.name || 'Nom de la méthode'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex: MonCash (Digicel), Virement Sogebank, NatCash..."
                      value={editingPaymentMethod.name || ''}
                      onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, name: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl text-sm focus:bg-white focus:outline-hidden focus:border-[#EF5A33]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-[#171717]">
                      {t.admin.paymentModal?.type || 'Type de paiement'}
                    </label>
                    <select
                      value={editingPaymentMethod.type || 'bank_transfer'}
                      onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, type: e.target.value as any })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl text-sm focus:bg-white focus:outline-hidden focus:border-[#EF5A33]"
                    >
                      <option value="bank_transfer">Virement Bancaire</option>
                      <option value="moncash">MonCash (Mobile)</option>
                      <option value="natcash">NatCash (Mobile)</option>
                      <option value="wire">Virement International (SWIFT)</option>
                      <option value="other">Autre / Carte / Passerelle</option>
                    </select>
                  </div>
                </div>

                {/* LOGO OR IMAGE URL FIELD & LIVE PREVIEW (USER REQUEST) */}
                <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E2] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-[#171717] flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#EF5A33]" />
                      <span>{t.admin.paymentModal?.logoUrl || 'Lien du logo ou image (URL)'}</span>
                    </label>
                    {editingPaymentMethod.logo_url && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageLoadError(false);
                          setEditingPaymentMethod({ ...editingPaymentMethod, logo_url: '' });
                        }}
                        className="text-[11px] text-[#737373] hover:text-rose-600 underline"
                      >
                        Effacer le logo
                      </button>
                    )}
                  </div>

                  <input
                    type="url"
                    placeholder={t.admin.paymentModal?.logoUrlPlaceholder || 'https://... (ex: https://site.com/logo.png ou lien image direct)'}
                    value={editingPaymentMethod.logo_url || ''}
                    onChange={(e) => {
                      setImageLoadError(false);
                      setEditingPaymentMethod({ ...editingPaymentMethod, logo_url: e.target.value });
                    }}
                    className="w-full p-2.5 bg-white border border-[#E8E6E2] rounded-xl text-xs font-mono focus:outline-hidden focus:border-[#EF5A33]"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-[#737373] block">
                      Préréglages rapides (cliquez pour insérer) :
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_PAYMENT_LOGOS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setImageLoadError(false);
                            setEditingPaymentMethod({ ...editingPaymentMethod, logo_url: preset.url });
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-[#171717] hover:text-white rounded-lg border border-[#E8E6E2] text-[11px] transition-colors"
                        >
                          + {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Image Preview Box */}
                  <div className="pt-2 border-t border-[#E8E6E2]/80">
                    <span className="text-[11px] text-[#737373] block mb-2 font-medium">
                      {t.admin.paymentModal?.previewLogo || 'Aperçu du logo / image en direct'} :
                    </span>

                    {editingPaymentMethod.logo_url ? (
                      <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-[#E8E6E2]">
                        <div className="w-16 h-16 rounded-xl bg-[#FAF9F6] border border-[#E8E6E2] p-1 flex items-center justify-center overflow-hidden shrink-0">
                          {imageLoadError ? (
                            <div className="text-center text-rose-500 text-[10px] p-1">
                              <AlertCircle className="w-5 h-5 mx-auto mb-0.5" />
                              <span>Erreur lien</span>
                            </div>
                          ) : (
                            <img
                              src={editingPaymentMethod.logo_url}
                              alt="Aperçu logo"
                              className="w-full h-full object-contain rounded-lg"
                              referrerPolicy="no-referrer"
                              onError={() => setImageLoadError(true)}
                              onLoad={() => setImageLoadError(false)}
                            />
                          )}
                        </div>

                        <div className="space-y-1">
                          <p className="font-semibold text-xs text-[#171717]">
                            {imageLoadError ? 'Impossible de charger l’image' : 'Logo prêt pour l’affichage'}
                          </p>
                          <p className="text-[11px] text-[#737373] break-all font-mono line-clamp-1">
                            {editingPaymentMethod.logo_url}
                          </p>
                          {!imageLoadError && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                              <Check className="w-3 h-3" />
                              <span>Image validée et prête</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-white rounded-xl border border-dashed border-[#E8E6E2] text-center text-[#737373] text-[11px]">
                        <span>Aucun lien de logo spécifié. Une icône par défaut sera affichée.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-1 text-[#171717]">
                      {t.admin.paymentModal?.accountName || 'Nom du titulaire / Bénéficiaire'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex: GALERIE KAYOLA S.A."
                      value={editingPaymentMethod.account_name || ''}
                      onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, account_name: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#EF5A33]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-[#171717]">
                      {t.admin.paymentModal?.accountNumber || 'Numéro de compte / IBAN / Tél'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex: +509 3812-4455 ou 210-0987-65432-01"
                      value={editingPaymentMethod.account_number || ''}
                      onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, account_number: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl font-mono focus:bg-white focus:outline-hidden focus:border-[#EF5A33]"
                    />
                  </div>
                </div>

                {/* Phone number optional */}
                <div>
                  <label className="font-semibold block mb-1 text-[#171717]">
                    {t.admin.paymentModal?.phoneNumber || 'Numéro de téléphone de contact (optionnel)'}
                  </label>
                  <input
                    type="text"
                    placeholder="ex: +509 3812-4455"
                    value={editingPaymentMethod.phone_number || ''}
                    onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, phone_number: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#EF5A33]"
                  />
                </div>

                {/* Descriptions FR & EN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-1 text-[#171717]">
                      {t.admin.paymentModal?.descriptionFr || 'Description courte (Français)'}
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Paiement instantané via votre compte MonCash..."
                      value={editingPaymentMethod.description_fr || ''}
                      onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, description_fr: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#EF5A33]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1 text-[#171717]">
                      {t.admin.paymentModal?.descriptionEn || 'Description courte (Anglais)'}
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Instant mobile transfer via MonCash account..."
                      value={editingPaymentMethod.description_en || ''}
                      onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, description_en: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#EF5A33]"
                    />
                  </div>
                </div>

                {/* Instructions FR & EN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-1 text-[#171717]">
                      {t.admin.paymentModal?.instructionsFr || 'Instructions de paiement détaillées (FR)'}
                    </label>
                    <textarea
                      rows={3}
                      placeholder="ex: Effectuez le transfert vers le compte ci-dessus avec le numéro de commande en référence..."
                      value={editingPaymentMethod.instructions_fr || ''}
                      onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, instructions_fr: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#EF5A33]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1 text-[#171717]">
                      {t.admin.paymentModal?.instructionsEn || 'Instructions de paiement détaillées (EN)'}
                    </label>
                    <textarea
                      rows={3}
                      placeholder="ex: Send the transfer to the account above with your Order # as reference..."
                      value={editingPaymentMethod.instructions_en || ''}
                      onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, instructions_en: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#EF5A33]"
                    />
                  </div>
                </div>

                {/* Additional Information FR & EN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-1 text-[#171717]">
                      {t.admin.paymentModal?.additionalInfoFr || 'Détails complémentaires / Swift / Agence (FR)'}
                    </label>
                    <input
                      type="text"
                      placeholder="ex: SWIFT : SOGEHTPPXXX — Agence Pétion-Ville"
                      value={editingPaymentMethod.additional_information_fr || ''}
                      onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, additional_information_fr: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#EF5A33]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1 text-[#171717]">
                      {t.admin.paymentModal?.additionalInfoEn || 'Détails complémentaires / Swift / Agence (EN)'}
                    </label>
                    <input
                      type="text"
                      placeholder="ex: SWIFT: SOGEHTPPXXX — Petion-Ville Branch"
                      value={editingPaymentMethod.additional_information_en || ''}
                      onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, additional_information_en: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#EF5A33]"
                    />
                  </div>
                </div>

                {/* Active Checkbox */}
                <div className="pt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer p-3 bg-[#FAF9F6] rounded-xl border border-[#E8E6E2] w-full">
                    <input
                      type="checkbox"
                      checked={Boolean(editingPaymentMethod.is_active)}
                      onChange={(e) => setEditingPaymentMethod({ ...editingPaymentMethod, is_active: e.target.checked })}
                      className="w-4 h-4 text-[#EF5A33] rounded-md accent-[#EF5A33]"
                    />
                    <span className="font-semibold text-xs text-[#171717]">
                      {t.admin.paymentModal?.isActive || 'Actif pour le checkout (visible par les clients)'}
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-[#E8E6E2] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(false)}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#737373] hover:text-[#171717] hover:bg-[#FAF9F6]"
                  >
                    {t.admin.paymentModal?.cancelBtn || 'Annuler'}
                  </button>
                  <button
                    type="submit"
                    className="px-7 py-2.5 rounded-full bg-[#EF5A33] text-white text-xs font-semibold hover:bg-[#D94725] transition-all shadow-md"
                  >
                    {t.admin.paymentModal?.saveBtn || 'Enregistrer le moyen de paiement'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CATEGORY / COLLECTION FORM MODAL */}
      <AnimatePresence>
        {categoryModalOpen && editingCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setCategoryModalOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl border border-[#E8E6E2]"
            >
              <div className="flex items-center justify-between border-b border-[#E8E6E2] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#FAF9F6] border border-[#E8E6E2] flex items-center justify-center text-[#EF5A33]">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#171717]">
                      {editingCategory.id && categories.some((c) => c.id === editingCategory.id)
                        ? (t.admin.categoryModal?.editTitle || 'Modifier la collection / catégorie')
                        : (t.admin.categoryModal?.createTitle || 'Ajouter une nouvelle collection / catégorie')}
                    </h3>
                    <p className="text-xs text-[#737373]">
                      Définissez les titres multilingues, la description et l’image de mise en valeur.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="p-2 text-[#737373] hover:text-[#171717] rounded-full hover:bg-[#FAF9F6]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                {/* Names FR & EN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-1 text-[#171717]">
                      {t.admin.categoryModal?.nameFr || 'Nom de la collection (Français)'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Peinture Contemporaine"
                      value={editingCategory.name_fr || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name_fr: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#EF5A33]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1 text-[#171717]">
                      {t.admin.categoryModal?.nameEn || 'Nom de la collection (Anglais)'}
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Contemporary Painting"
                      value={editingCategory.name_en || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name_en: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#EF5A33]"
                    />
                  </div>
                </div>

                {/* Slug (URL key) */}
                <div>
                  <label className="font-semibold block mb-1 text-[#171717]">
                    {t.admin.categoryModal?.slug || 'Identifiant URL (Slug)'}
                  </label>
                  <input
                    type="text"
                    placeholder="ex: peinture-contemporaine (laisser vide pour auto-générer)"
                    value={editingCategory.slug || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl font-mono focus:bg-white focus:outline-hidden focus:border-[#EF5A33]"
                  />
                  <span className="text-[10px] text-[#737373] mt-1 block">
                    Utilisé pour les filtres et l'URL directe du catalogue.
                  </span>
                </div>

                {/* Cover Image URL */}
                <div className="space-y-3 p-4 bg-[#FAF9F6] rounded-2xl border border-[#E8E6E2]">
                  <div>
                    <label className="font-semibold block mb-1 text-[#171717]">
                      {t.admin.categoryModal?.imageUrl || 'Lien de l’image de couverture (URL)'}
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... (Image haute résolution)"
                        value={editingCategory.image_url || ''}
                        onChange={(e) => {
                          setEditingCategory({ ...editingCategory, image_url: e.target.value });
                          setCategoryImageLoadError(false);
                        }}
                        className="w-full p-2.5 pl-3 pr-8 bg-white border border-[#E8E6E2] rounded-xl font-mono focus:outline-hidden focus:border-[#EF5A33]"
                      />
                      <Link2 className="w-3.5 h-3.5 text-[#737373] absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Preset Suggestions */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-[#737373] font-medium block">
                      {t.admin.categoryModal?.presetImages || 'Suggestions d’images d’art (1-clic) :'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_CATEGORY_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setEditingCategory({ ...editingCategory, image_url: preset.url });
                            setCategoryImageLoadError(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E6E2] text-[10px] text-[#171717] hover:border-[#EF5A33] hover:text-[#EF5A33] transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visual Preview */}
                  <div className="pt-2 border-t border-[#E8E6E2]">
                    <span className="text-[11px] font-semibold text-[#737373] block mb-2">
                      Aperçu de la bannière de collection :
                    </span>
                    {editingCategory.image_url && !categoryImageLoadError ? (
                      <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-[#E8E6E2]">
                        <div className="w-28 h-20 rounded-xl overflow-hidden bg-[#FAF9F6] border border-[#E8E6E2] shrink-0">
                          <img
                            src={editingCategory.image_url}
                            alt="Aperçu catégorie"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={() => setCategoryImageLoadError(true)}
                          />
                        </div>
                        <div className="space-y-1 text-xs">
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            ✓ Image valide
                          </span>
                          <p className="text-[11px] text-[#737373] line-clamp-1 font-mono">
                            {editingCategory.image_url}
                          </p>
                          <p className="text-[11px] text-[#171717] font-semibold">
                            {editingCategory.name_fr || 'Titre de la collection'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-white rounded-xl border border-dashed border-[#E8E6E2] text-[#737373] text-center text-[11px]">
                        {categoryImageLoadError
                          ? '⚠️ Impossible de charger l’image. Vérifiez l’URL.'
                          : 'Saisissez une URL pour prévisualiser la bannière.'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Descriptions FR & EN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-1 text-[#171717]">
                      {t.admin.categoryModal?.descriptionFr || 'Description détaillée (Français)'}
                    </label>
                    <textarea
                      rows={3}
                      placeholder="ex: Huiles, acryliques et toiles texturales aux pigments vibrants..."
                      value={editingCategory.description_fr || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, description_fr: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#EF5A33]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1 text-[#171717]">
                      {t.admin.categoryModal?.descriptionEn || 'Description détaillée (Anglais)'}
                    </label>
                    <textarea
                      rows={3}
                      placeholder="ex: Oils, acrylics and textured canvases with vibrant pigments..."
                      value={editingCategory.description_en || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, description_en: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#EF5A33]"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-[#E8E6E2] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCategoryModalOpen(false)}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#737373] hover:text-[#171717] hover:bg-[#FAF9F6]"
                  >
                    {t.admin.categoryModal?.cancelBtn || 'Annuler'}
                  </button>
                  <button
                    type="submit"
                    className="px-7 py-2.5 rounded-full bg-[#EF5A33] text-white text-xs font-semibold hover:bg-[#D94725] transition-all shadow-md"
                  >
                    {t.admin.categoryModal?.saveBtn || 'Enregistrer la collection'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
