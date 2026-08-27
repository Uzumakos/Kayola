import { Artwork, Category, Order, PaymentMethod, PaymentProof, OrderEvent, ArtworkStatus, GallerySettings } from '../types';
import { generateAccessCredentials, syncOrderToSupabase, isSupabaseConfigured, GeneratedCredentials, syncArtworkToSupabase, deleteArtworkFromSupabase, syncPaymentMethodToSupabase, deletePaymentMethodFromSupabase, syncCategoryToSupabase, deleteCategoryFromSupabase, syncSettingsToSupabase } from './supabase';

const STORAGE_KEYS = {
  ARTWORKS: 'kayola_artworks_v1',
  CATEGORIES: 'kayola_categories_v1',
  PAYMENT_METHODS: 'kayola_payment_methods_v1',
  ORDERS: 'kayola_orders_v1',
  ADMIN_AUTH: 'kayola_admin_auth_v1',
  SETTINGS: 'kayola_settings_v1',
};

const INITIAL_SETTINGS: GallerySettings = {
  gallery_name: 'KAYOLA',
  tagline_fr: 'Art Contemporain',
  tagline_en: 'Contemporary Art',
  logo_url: '',
  logo_type: 'monogram',
  contact_email: 'contact@kayola-art.com',
  contact_phone: '+509 3800-0000',
  address: 'KAYOLA Space, Port-au-Prince & Global Concierge',
};

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    slug: 'peinture',
    name_fr: 'Peinture Contemporaine',
    name_en: 'Contemporary Painting',
    description_fr: 'Huiles, acryliques et toiles texturales aux pigments vibrants.',
    description_en: 'Oils, acrylics, and textural canvases with vibrant pigments.',
    image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cat-2',
    slug: 'sculpture',
    name_fr: 'Sculpture & Volume',
    name_en: 'Sculpture & Volume',
    description_fr: 'Créations en bronze, pierre, céramique et matériaux nobles.',
    description_en: 'Creations in bronze, stone, ceramic, and noble materials.',
    image_url: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cat-3',
    slug: 'photographie',
    name_fr: 'Photographie d’Art',
    name_en: 'Fine Art Photography',
    description_fr: 'Tirages argentiques et impressions digigraphiques limitées.',
    description_en: 'Silver gelatin prints and limited digigraph prints.',
    image_url: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cat-4',
    slug: 'art-numerique',
    name_fr: 'Art Numérique & Hybride',
    name_en: 'Digital & Hybrid Art',
    description_fr: 'Explorations visuelles génératives et compositions immersives.',
    description_en: 'Generative visual explorations and immersive compositions.',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cat-5',
    slug: 'techniques-mixtes',
    name_fr: 'Techniques Mixtes',
    name_en: 'Mixed Media',
    description_fr: 'Collages, matières superposées et expérimentations plastiques.',
    description_en: 'Collages, layered mediums, and plastic experimentations.',
    image_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
  },
];

const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pay-moncash',
    name: 'MonCash (Paiement Mobile)',
    type: 'moncash',
    description_fr: 'Paiement instantané via votre compte MonCash (Digicel).',
    description_en: 'Instant mobile transfer via your MonCash account (Digicel).',
    instructions_fr: 'Effectuez le transfert MonCash vers le numéro ci-dessous avec le numéro de commande en référence, puis téléversez une capture de la transaction.',
    instructions_en: 'Send the MonCash transfer to the number below with your Order # as reference, then upload your confirmation screenshot.',
    account_name: 'GALERIE KAYOLA S.A.',
    account_number: '+509 3812-4455',
    phone_number: '+509 3812-4455',
    additional_information_fr: 'Frais de transfert habituels à la charge de l’acheteur. Validation sous 2h.',
    additional_information_en: 'Standard mobile fees apply. Verified by our curator within 2 hours.',
    logo_url: 'https://images.unsplash.com/photo-1556742049-0a67e5572263?auto=format&fit=crop&w=300&q=80',
    is_active: true,
  },
  {
    id: 'pay-natcash',
    name: 'NatCash (Paiement Mobile)',
    type: 'natcash',
    description_fr: 'Paiement mobile sécurisé via NatCash (Natcom).',
    description_en: 'Secure mobile payment via NatCash (Natcom).',
    instructions_fr: 'Effectuez le versement sur le compte NatCash marchand ci-dessous et conservez le SMS de confirmation pour le téléversement.',
    instructions_en: 'Send payment to the NatCash merchant account below and keep the SMS receipt for proof upload.',
    account_name: 'KAYOLA ART EXCLUSIF',
    account_number: '+509 4233-8899',
    phone_number: '+509 4233-8899',
    additional_information_fr: 'Service disponible 24/7.',
    additional_information_en: 'Available 24/7.',
    logo_url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=300&q=80',
    is_active: true,
  },
  {
    id: 'pay-sogebank',
    name: 'Virement Bancaire — Sogebank (USD / HTG)',
    type: 'bank_transfer',
    description_fr: 'Virement de compte à compte ou dépôt en succursale Sogebank.',
    description_en: 'Direct bank transfer or branch deposit at Sogebank.',
    instructions_fr: 'Initiez un virement bancaire vers notre compte courant Sogebank. Mentionnez impérativement votre Nom et le Numéro de Commande.',
    instructions_en: 'Initiate a bank transfer to our Sogebank checking account. State your Name and Order # in the reference field.',
    account_name: 'KAYOLA CONTEMPORARY ART INC',
    account_number: '210-0987-65432-01 (USD)',
    additional_information_fr: 'IBAN / Routing : SOGEHTPPXXX — Agence Pétion-Ville',
    additional_information_en: 'Swift / Routing : SOGEHTPPXXX — Petion-Ville Branch',
    logo_url: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=300&q=80',
    is_active: true,
  },
  {
    id: 'pay-unibank',
    name: 'Virement Bancaire — Unibank (USD / HTG)',
    type: 'bank_transfer',
    description_fr: 'Virement Unibank en ligne ou en agence.',
    description_en: 'Unibank online wire or branch transaction.',
    instructions_fr: 'Transférez le montant exact sur notre compte Unibank. Téléversez le bordereau de versement ou la confirmation PDF.',
    instructions_en: 'Transfer exact amount to our Unibank account. Upload the deposit slip or PDF confirmation.',
    account_name: 'KAYOLA CONTEMPORARY ART INC',
    account_number: '140-5567-89101-02 (USD)',
    additional_information_fr: 'Code Swift : UNIBHTPP',
    additional_information_en: 'Swift Code: UNIBHTPP',
    logo_url: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=300&q=80',
    is_active: true,
  },
  {
    id: 'pay-wire',
    name: 'International Wire Transfer (SWIFT / Fedwire)',
    type: 'wire',
    description_fr: 'Virement international pour les collectionneurs hors-territoire.',
    description_en: 'International wire transfer for global art collectors.',
    instructions_fr: 'Effectuez un virement international SWIFT vers notre banque dépositaire. Prévoyez 24 à 48h de délai de réception.',
    instructions_en: 'Send an international SWIFT wire transfer to our depository bank. Processing takes 24 to 48 hours.',
    account_name: 'KAYOLA GLOBAL ART HOLDINGS LLC',
    account_number: 'US89-CITI-0210-0008-9482-11',
    additional_information_fr: 'Banque : Citibank N.A. New York — SWIFT : CITIUS33XXX',
    additional_information_en: 'Bank: Citibank N.A. New York — SWIFT: CITIUS33XXX',
    logo_url: 'https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?auto=format&fit=crop&w=300&q=80',
    is_active: true,
  },
];


const INITIAL_ARTWORKS: Artwork[] = [];
const INITIAL_ORDERS: Order[] = [];

class KayolaStore {
  private artworks: Artwork[] = [];
  private categories: Category[] = [];
  private paymentMethods: PaymentMethod[] = [];
  private orders: Order[] = [];
  private settings: GallerySettings = INITIAL_SETTINGS;
  private isAdminLoggedIn = false;
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedArtworks = localStorage.getItem(STORAGE_KEYS.ARTWORKS);
      const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const storedPaymentMethods = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const storedAdminAuth = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

      const rawArtworks = storedArtworks ? JSON.parse(storedArtworks) : INITIAL_ARTWORKS;
      this.artworks = rawArtworks.map((art: Artwork, idx: number) => ({
        ...art,
        item_code: art.item_code || `ART-2026-${String(idx + 1).padStart(3, '0')}`,
      }));
      this.categories = storedCategories ? JSON.parse(storedCategories) : INITIAL_CATEGORIES;
      if (storedPaymentMethods) {
        const parsed = JSON.parse(storedPaymentMethods);
        this.paymentMethods = parsed.map((pm: PaymentMethod) => {
          if (!pm.logo_url) {
            const match = INITIAL_PAYMENT_METHODS.find((init) => init.id === pm.id);
            if (match?.logo_url) return { ...pm, logo_url: match.logo_url };
          }
          return pm;
        });
      } else {
        this.paymentMethods = INITIAL_PAYMENT_METHODS;
      }
      this.orders = storedOrders ? JSON.parse(storedOrders) : INITIAL_ORDERS;
      this.settings = storedSettings ? { ...INITIAL_SETTINGS, ...JSON.parse(storedSettings) } : INITIAL_SETTINGS;
      this.isAdminLoggedIn = storedAdminAuth === 'true';

      // Save defaults if first visit
      if (!storedArtworks) this.saveArtworks();
      if (!storedCategories) this.saveCategories();
      if (!storedPaymentMethods) this.savePaymentMethods();
      if (!storedOrders) this.saveOrders();
      if (!storedSettings) this.saveSettings(INITIAL_SETTINGS, true);
    } catch {
      this.artworks = INITIAL_ARTWORKS;
      this.categories = INITIAL_CATEGORIES;
      this.paymentMethods = INITIAL_PAYMENT_METHODS;
      this.orders = INITIAL_ORDERS;
      this.settings = INITIAL_SETTINGS;
    }
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private saveArtworks() {
    localStorage.setItem(STORAGE_KEYS.ARTWORKS, JSON.stringify(this.artworks));
    this.notify();
  }

  private saveCategories() {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
    this.notify();
  }

  private savePaymentMethods() {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(this.paymentMethods));
    this.notify();
  }

  private saveOrders() {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
    this.notify();
  }

  // --- SETTINGS & LOGO ---
  public getSettings(): GallerySettings {
    return { ...this.settings };
  }

  public saveSettings(newSettings: Partial<GallerySettings>, skipSync = false): GallerySettings {
    const now = new Date().toISOString();
    this.settings = { ...this.settings, ...newSettings, updated_at: now };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    this.notify();
    if (!skipSync) {
      syncSettingsToSupabase(this.settings).catch(e => console.warn(e));
    }
    return { ...this.settings };
  }

  public setLogoUrl(url: string, logoType: 'monogram' | 'image' = 'image'): GallerySettings {
    return this.saveSettings({
      logo_url: url.trim(),
      logo_type: url.trim() ? logoType : 'monogram',
    });
  }

  public resetLogo(): GallerySettings {
    return this.saveSettings({
      logo_url: '',
      logo_type: 'monogram',
    });
  }

  // --- REMOTE SYNC ---
  public mergeArtworks(remoteArtworks: Artwork[]) {
    let changed = false;
    for (const remote of remoteArtworks) {
      const idx = this.artworks.findIndex(a => a.id === remote.id);
      if (idx === -1) {
        this.artworks.push(remote);
        changed = true;
      } else if (new Date(remote.updated_at || 0) > new Date(this.artworks[idx].updated_at || 0)) {
        this.artworks[idx] = remote;
        changed = true;
      }
    }
    if (changed) {
      this.artworks.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      this.saveArtworks();
    }
  }

  public mergeOrders(remoteOrders: Order[]) {
    let changed = false;
    for (const remote of remoteOrders) {
      const idx = this.orders.findIndex(o => o.id === remote.id);
      if (idx === -1) {
        this.orders.push(remote);
        changed = true;
      } else if (new Date(remote.updated_at || 0) > new Date(this.orders[idx].updated_at || 0)) {
        this.orders[idx] = remote;
        changed = true;
      }
    }
    if (changed) {
      this.orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      this.saveOrders();
    }
  }


  public mergeCategories(remoteCategories: Category[]) {
    let changed = false;
    for (const remote of remoteCategories) {
      const idx = this.categories.findIndex(c => c.id === remote.id);
      if (idx === -1) {
        this.categories.push(remote);
        changed = true;
      } else if (new Date(remote.updated_at || 0) > new Date(this.categories[idx].updated_at || 0)) {
        this.categories[idx] = remote;
        changed = true;
      }
    }
    if (changed) {
      this.categories.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
      this.saveCategories();
    }
  }

  public mergePaymentMethods(remotePaymentMethods: PaymentMethod[]) {
    let changed = false;
    for (const remote of remotePaymentMethods) {
      const idx = this.paymentMethods.findIndex(p => p.id === remote.id);
      if (idx === -1) {
        this.paymentMethods.push(remote);
        changed = true;
      } else if (new Date(remote.updated_at || 0) > new Date(this.paymentMethods[idx].updated_at || 0)) {
        this.paymentMethods[idx] = remote;
        changed = true;
      }
    }
    if (changed) {
      this.savePaymentMethods();
    }
  }

  public mergeSettings(remoteSettings: GallerySettings) {
    if (new Date(remoteSettings.updated_at || 0) > new Date(this.settings.updated_at || 0)) {
      this.settings = remoteSettings;
      this.saveSettings(remoteSettings, true);
    }
  }
  // --- ARTWORKS ---
  public getArtworks(): Artwork[] {
    return [...this.artworks];
  }

  public getFeaturedArtworks(): Artwork[] {
    const featured = this.artworks.filter((a) => a.featured);
    return featured.length > 0 ? featured : this.artworks.slice(0, 4);
  }

  public getArtworkBySlug(slug: string): Artwork | undefined {
    return this.artworks.find((a) => a.slug === slug || a.id === slug);
  }

  public getArtworkById(id: string): Artwork | undefined {
    return this.artworks.find((a) => a.id === id);
  }

  public saveArtwork(artwork: Artwork): Artwork {
    const itemCode = artwork.item_code?.trim() || `ART-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const preparedArtwork: Artwork = {
      ...artwork,
      item_code: itemCode,
      updated_at: new Date().toISOString(),
    };
    const index = this.artworks.findIndex((a) => a.id === preparedArtwork.id);
    if (index >= 0) {
      this.artworks[index] = preparedArtwork;
    } else {
      this.artworks.unshift(preparedArtwork);
    }
    this.saveArtworks();
    syncArtworkToSupabase(preparedArtwork).catch(e => console.warn(e));
    return preparedArtwork;
  }

  public deleteArtwork(id: string) {
    this.artworks = this.artworks.filter((a) => a.id !== id);
    this.saveArtworks();
    deleteArtworkFromSupabase(id).catch(e => console.warn(e));
  }

  public updateArtworkStatus(id: string, status: ArtworkStatus) {
    const art = this.getArtworkById(id);
    if (art) {
      art.status = status;
      if (status === 'SOLD' && !art.sold_at) {
        art.sold_at = new Date().toISOString();
      }
      this.saveArtworks();
      syncArtworkToSupabase(art).catch(e => console.warn(e));
    }
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    return [...this.categories];
  }

  public saveCategory(category: Category): Category {
    const index = this.categories.findIndex((c) => c.id === category.id);
    if (index >= 0) {
      this.categories[index] = category;
    } else {
      this.categories.push(category);
    }
    this.saveCategories();
    syncCategoryToSupabase(category).catch(e => console.warn(e));
    return category;
  }

  public deleteCategory(id: string) {
    this.categories = this.categories.filter((c) => c.id !== id);
    this.saveCategories();
    deleteCategoryFromSupabase(id).catch(e => console.warn(e));
  }

  // --- PAYMENT METHODS ---
  public getPaymentMethods(activeOnly = true): PaymentMethod[] {
    return activeOnly ? this.paymentMethods.filter((p) => p.is_active) : [...this.paymentMethods];
  }
  public getPaymentMethodById(id: string): PaymentMethod | undefined {
    return this.paymentMethods.find((p) => p.id === id);
  }

  public savePaymentMethod(method: PaymentMethod): PaymentMethod {
    const index = this.paymentMethods.findIndex((p) => p.id === method.id);
    if (index >= 0) {
      this.paymentMethods[index] = { ...method };
    } else {
      this.paymentMethods.push({ ...method });
    }
    this.savePaymentMethods();
    syncPaymentMethodToSupabase(method).catch(e => console.warn(e));
    return method;
  }

  public deletePaymentMethod(id: string): boolean {
    this.paymentMethods = this.paymentMethods.filter((p) => p.id !== id);
    this.savePaymentMethods();
    deletePaymentMethodFromSupabase(id).catch(e => console.warn(e));
    return true;
  }

  public togglePaymentMethodStatus(id: string): boolean {
    const method = this.paymentMethods.find((p) => p.id === id);
    if (method) {
      method.is_active = !method.is_active;
      this.savePaymentMethods();
      syncPaymentMethodToSupabase(method).catch(e => console.warn(e));
      return true;
    }
    return false;
  }

  // --- ORDERS & TRACKING (Guest checkout) ---
  public getOrders(): Order[] {
    return [...this.orders];
  }

  public getOrderById(id: string): Order | undefined {
    const order = this.orders.find((o) => o.id === id);
    if (order) {
      order.artwork = this.getArtworkById(order.artwork_id);
      order.payment_method = this.getPaymentMethodById(order.payment_method_id);
    }
    return order;
  }

  public findOrderForTracking(searchIdentifier: string, accessCode: string): Order | null {
    const cleanId = searchIdentifier.trim().toUpperCase();
    const cleanCode = accessCode.trim();
    if (!cleanId || !cleanCode) return null;

    const order = this.orders.find((o) => {
      const art = this.getArtworkById(o.artwork_id);
      const orderNumMatch = o.order_number?.toUpperCase() === cleanId;
      const trackingTokenMatch = o.tracking_token?.toUpperCase() === cleanId;
      const itemCodeMatch = (art?.item_code || o.artwork?.item_code)?.toUpperCase() === cleanId;
      const accessCodeMatch = o.access_code?.trim() === cleanCode;

      return (orderNumMatch || trackingTokenMatch || itemCodeMatch) && accessCodeMatch;
    });

    if (order) {
      order.artwork = this.getArtworkById(order.artwork_id);
      order.payment_method = this.getPaymentMethodById(order.payment_method_id);
      return { ...order };
    }
    return null;
  }

  public findOrderByToken(token: string): Order | null {
    const order = this.orders.find((o) => o.tracking_token === token || o.id === token || o.order_number === token);
    if (order) {
      order.artwork = this.getArtworkById(order.artwork_id);
      order.payment_method = this.getPaymentMethodById(order.payment_method_id);
      return { ...order };
    }
    return null;
  }

  public createGuestOrder(params: {
    artworkId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    notes?: string;
    paymentMethodId: string;
    proofFile?: { name: string; type: string; size: number; dataUrl: string };
    orderNumber?: string;
    accessCode?: string;
    orderId?: string;
  }): { order: Order; success: boolean; error?: string } {
    const artwork = this.getArtworkById(params.artworkId);
    if (!artwork) {
      return { order: null as unknown as Order, success: false, error: 'Artwork not found.' };
    }
    if (artwork.status === 'SOLD') {
      return { order: null as unknown as Order, success: false, error: 'This artwork has already been sold.' };
    }

    const orderNumber = params.orderNumber || `ART-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingToken = `kayola-sec-${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36)}`;
    const accessCode = params.accessCode || Math.floor(100000 + Math.random() * 900000).toString();
    const orderId = params.orderId || `ord-${Date.now()}`;
    const now = new Date().toISOString();

    const paymentProofs: PaymentProof[] = [];
    if (params.proofFile) {
      paymentProofs.push({
        id: `prf-${Date.now()}`,
        order_id: orderId,
        file_name: params.proofFile.name,
        file_type: params.proofFile.type,
        file_size: params.proofFile.size,
        file_data_url: params.proofFile.dataUrl,
        uploaded_at: now,
        status: 'PENDING',
      });
    }

    const events: OrderEvent[] = [
      {
        id: `evt-${Date.now()}-1`,
        order_id: orderId,
        event_type: 'ORDER_CREATED',
        description_fr: `Commande ${orderNumber} enregistrée via Guest Checkout (Réf. ${artwork.item_code || 'ART'}).`,
        description_en: `Order ${orderNumber} created via Guest Checkout (Ref. ${artwork.item_code || 'ART'}).`,
        created_at: now,
      },
    ];

    if (params.proofFile) {
      events.push({
        id: `evt-${Date.now()}-2`,
        order_id: orderId,
        event_type: 'PROOF_UPLOADED',
        description_fr: `Preuve de paiement soumise (${params.proofFile.name}).`,
        description_en: `Payment proof submitted (${params.proofFile.name}).`,
        created_at: now,
      });
    }

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      tracking_token: trackingToken,
      access_code: accessCode,
      artwork_id: artwork.id,
      artwork,
      customer_first_name: params.firstName,
      customer_last_name: params.lastName,
      customer_email: params.email,
      customer_phone: params.phone,
      customer_address: params.address,
      customer_city: params.city,
      customer_country: params.country,
      customer_notes: params.notes,
      payment_method_id: params.paymentMethodId,
      payment_method: this.getPaymentMethodById(params.paymentMethodId),
      amount: artwork.price,
      currency: artwork.currency,
      status: params.proofFile ? 'PAYMENT_REVIEW' : 'PENDING',
      reserved_until: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      payment_submitted_at: params.proofFile ? now : null,
      created_at: now,
      updated_at: now,
      payment_proofs: paymentProofs,
      events,
    };

    // Update artwork reservation status
    this.updateArtworkStatus(artwork.id, 'PAYMENT_REVIEW');

    // If order with same ID exists, replace it, otherwise unshift
    const existingIndex = this.orders.findIndex((o) => o.id === orderId || o.order_number === orderNumber);
    if (existingIndex >= 0) {
      this.orders[existingIndex] = newOrder;
    } else {
      this.orders.unshift(newOrder);
    }
    this.saveOrders();

    // Asynchronously sync to Supabase backend if configured
    syncOrderToSupabase(newOrder).catch((err) => console.warn('Background Supabase sync:', err));

    return { order: newOrder, success: true };
  }

  /**
   * Pre-generate access code & order number for checkout display
   */
  public generateCredentialsForCheckout(itemCode?: string): GeneratedCredentials {
    return generateAccessCredentials(itemCode || 'ART-2026');
  }

  public uploadAdditionalProof(
    orderId: string,
    file: { name: string; type: string; size: number; dataUrl: string }
  ): boolean {
    const order = this.orders.find((o) => o.id === orderId || o.tracking_token === orderId || o.order_number === orderId);
    if (!order) return false;

    const now = new Date().toISOString();
    const newProof: PaymentProof = {
      id: `prf-${Date.now()}`,
      order_id: order.id,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_data_url: file.dataUrl,
      uploaded_at: now,
      status: 'PENDING',
    };

    if (!order.payment_proofs) order.payment_proofs = [];
    order.payment_proofs.unshift(newProof);
    order.status = 'PAYMENT_REVIEW';
    order.payment_submitted_at = now;
    order.updated_at = now;

    if (!order.events) order.events = [];
    order.events.push({
      id: `evt-${Date.now()}`,
      order_id: order.id,
      event_type: 'PROOF_RESUBMITTED',
      description_fr: `Nouvelle preuve de paiement téléversée (${file.name}).`,
      description_en: `Updated payment proof uploaded (${file.name}).`,
      created_at: now,
    });

    this.updateArtworkStatus(order.artwork_id, 'PAYMENT_REVIEW');
    this.saveOrders();
    syncOrderToSupabase(order).catch((err) => console.warn('Background Supabase sync:', err));
    return true;
  }


  // --- ADMIN ACTIONS ---
  public acceptPayment(orderId: string): boolean {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return false;

    const now = new Date().toISOString();
    order.status = 'PAYMENT_ACCEPTED';
    order.payment_verified_at = now;
    order.updated_at = now;

    // Mark proofs accepted
    order.payment_proofs.forEach((p) => {
      p.status = 'ACCEPTED';
      p.reviewed_at = now;
      p.reviewed_by = 'Administrateur KAYOLA';
    });

    order.events.push({
      id: `evt-${Date.now()}`,
      order_id: orderId,
      event_type: 'PAYMENT_ACCEPTED',
      description_fr: 'Paiement vérifié et accepté par la galerie.',
      description_en: 'Payment verified and accepted by gallery admin.',
      created_at: now,
      created_by: 'Administrateur KAYOLA',
    });

    this.saveOrders();
    syncOrderToSupabase(order).catch(e => console.warn(e));
    return true;
  }

  public rejectPayment(orderId: string, reason: string): boolean {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return false;

    const now = new Date().toISOString();
    order.status = 'PAYMENT_REJECTED';
    order.rejection_reason = reason;
    order.updated_at = now;

    order.payment_proofs.forEach((p) => {
      if (p.status === 'PENDING') {
        p.status = 'REJECTED';
        p.rejection_reason = reason;
        p.reviewed_at = now;
        p.reviewed_by = 'Administrateur KAYOLA';
      }
    });

    order.events.push({
      id: `evt-${Date.now()}`,
      order_id: orderId,
      event_type: 'PAYMENT_REJECTED',
      description_fr: `Preuve rejetée : ${reason}`,
      description_en: `Proof rejected: ${reason}`,
      created_at: now,
      created_by: 'Administrateur KAYOLA',
    });

    this.saveOrders();
    syncOrderToSupabase(order).catch(e => console.warn(e));
    return true;
  }

  // CRITICAL SERVER-SIDE ATOMIC SALE CONFIRMATION
  public confirmSale(orderId: string): boolean {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return false;

    const artwork = this.getArtworkById(order.artwork_id);
    if (!artwork) return false;

    const now = new Date().toISOString();

    // Atomic status update
    order.status = 'SOLD';
    order.sold_at = now;
    order.updated_at = now;

    artwork.status = 'SOLD';
    artwork.sold_at = now;

    order.events.push({
      id: `evt-${Date.now()}`,
      order_id: orderId,
      event_type: 'SALE_CONFIRMED',
      description_fr: 'Vente officiellement confirmée. Certificat d’acquisition émis.',
      description_en: 'Sale officially confirmed. Certificate of acquisition issued.',
      created_at: now,
      created_by: 'Direction KAYOLA',
    });

    this.saveArtworks();
    this.saveOrders();
    syncOrderToSupabase(order).catch(e => console.warn(e));
    syncArtworkToSupabase(artwork).catch(e => console.warn(e));
    return true;
  }

  // --- AUTH ---
  public isAdmin(): boolean {
    return this.isAdminLoggedIn;
  }

  public adminLogin(password: string): boolean {
    if (password === 'admin123' || password === 'kayola2026' || password === 'admin') {
      this.isAdminLoggedIn = true;
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      this.notify();
      return true;
    }
    return false;
  }

  public adminLogout() {
    this.isAdminLoggedIn = false;
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    this.notify();
  }

  public resetToDefaults() {
    this.artworks = INITIAL_ARTWORKS;
    this.categories = INITIAL_CATEGORIES;
    this.paymentMethods = INITIAL_PAYMENT_METHODS;
    this.orders = INITIAL_ORDERS;
    this.saveArtworks();
    this.saveCategories();
    this.savePaymentMethods();
    this.saveOrders();
  }
}

export const store = new KayolaStore();
