export type Locale = 'fr' | 'en' | 'ht';

export type ArtworkStatus = 'AVAILABLE' | 'RESERVED' | 'PAYMENT_REVIEW' | 'SOLD';

export type OrderStatus =
  | 'PENDING'
  | 'PAYMENT_PROOF_SUBMITTED'
  | 'PAYMENT_REVIEW'
  | 'PAYMENT_ACCEPTED'
  | 'PAYMENT_REJECTED'
  | 'SOLD'
  | 'CANCELLED';

export interface ArtworkImage {
  id: string;
  artwork_id: string;
  url: string;
  alt_text_fr: string;
  alt_text_en: string;
  alt_text_ht?: string;
  sort_order: number;
  is_primary?: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  name_ht?: string;
  description_fr: string;
  description_en: string;
  description_ht?: string;
  image_url?: string;
  count?: number;

  created_at?: string;
  updated_at?: string;
}

export interface Artwork {
  id: string;
  item_code?: string; // Code article / Référence d'inventaire
  slug: string;
  title_fr: string;
  title_en: string;
  title_ht?: string;
  artist: string;
  artist_bio_fr?: string;
  artist_bio_en?: string;
  artist_bio_ht?: string;
  description_fr: string;
  description_en: string;
  description_ht?: string;
  price: number;
  currency: string;
  category_id: string;
  technique_fr: string;
  technique_en: string;
  technique_ht?: string;
  materials_fr: string;
  materials_en: string;
  materials_ht?: string;
  year: number;
  width_cm: number;
  height_cm: number;
  depth_cm?: number;
  weight_kg?: number;
  is_framed: boolean;
  has_certificate: boolean;
  featured: boolean;
  status: ArtworkStatus;
  reserved_until?: string | null;
  sold_at?: string | null;
  images: ArtworkImage[];
  created_at: string;
  updated_at?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'moncash' | 'natcash' | 'bank_transfer' | 'wire' | 'other';
  description_fr: string;
  description_en: string;
  description_ht?: string;
  instructions_fr: string;
  instructions_en: string;
  instructions_ht?: string;
  account_name: string;
  account_number: string;
  phone_number?: string;
  additional_information_fr?: string;
  additional_information_en?: string;
  additional_information_ht?: string;
  logo_url?: string;
  is_active: boolean;
  created_at?: string;

  updated_at?: string;
}

export interface PaymentProof {
  id: string;
  order_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_data_url: string;
  uploaded_at: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  rejection_reason?: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  event_type:
  | 'ORDER_CREATED'
  | 'PROOF_UPLOADED'
  | 'PROOF_RESUBMITTED'
  | 'PAYMENT_ACCEPTED'
  | 'PAYMENT_REJECTED'
  | 'SALE_CONFIRMED'
  | 'ORDER_CANCELLED';
  description_fr: string;
  description_en: string;
  description_ht?: string;
  created_at: string;
  created_by?: string;
}

export interface Order {
  id: string;
  order_number: string;
  tracking_token: string;
  access_code: string;
  artwork_id: string;
  artwork?: Artwork;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_country: string;
  customer_notes?: string;
  payment_method_id: string;
  payment_method?: PaymentMethod;
  delivery_method?: 'delivery' | 'pickup';
  amount: number;
  currency: string;
  status: OrderStatus;
  reserved_until?: string | null;
  payment_submitted_at?: string | null;
  payment_verified_at?: string | null;
  sold_at?: string | null;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  payment_proofs: PaymentProof[];
  events: OrderEvent[];
}

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  avatar_url?: string;
}

export interface GallerySettings {
  gallery_name: string;
  tagline_fr: string;
  tagline_en: string;
  tagline_ht?: string;
  logo_url?: string;
  logo_type?: 'monogram' | 'image';
  favicon_url?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  pickup_address?: string;
  about_images?: string[];

  admin_email?: string;
  admin_password_hash?: string;

  updated_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read';
  created_at: string;
}

// EOF
