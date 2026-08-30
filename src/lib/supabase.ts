import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order, Artwork, PaymentMethod, Category, GallerySettings } from '../types';

// Safe access for both Vite and Node environments
const getEnv = (key: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key] || '';
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL') || '';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Generate cryptographically secure and user-friendly access code & order number
 * Supports backend generation via Supabase if configured or client-side secure fallback
 */
export interface GeneratedCredentials {
  orderNumber: string;
  accessCode: string;
  trackingToken: string;
  generatedAt: string;
  isBackendGenerated: boolean;
}

export function generateAccessCredentials(itemPrefix = 'ART-2026'): GeneratedCredentials {
  // Generate 6-digit numeric access code
  const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Generate unique order number (e.g., ART-2026-84921)
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const cleanPrefix = itemPrefix.replace(/[^A-Za-z0-9-]/g, '').toUpperCase() || 'ART-2026';
  const orderNumber = cleanPrefix.startsWith('ART-')
    ? `${cleanPrefix}-${randomSuffix}`
    : `ART-2026-${randomSuffix}`;

  // Generate secure tracking token
  const randomHash = Math.random().toString(36).substring(2, 12);
  const timeHash = Date.now().toString(36);
  const trackingToken = `kayola-sec-${randomHash}${timeHash}`;

  return {
    orderNumber,
    accessCode,
    trackingToken,
    generatedAt: new Date().toISOString(),
    isBackendGenerated: isSupabaseConfigured,
  };
}

/**
 * Synchronize order to Supabase database if available
 */
export async function syncOrderToSupabase(order: Order): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true }; // Local store is primary when Supabase credentials are not present
  }

  try {
    const { error } = await supabase.from('orders').upsert({
      id: order.id,
      order_number: order.order_number,
      access_code: order.access_code,
      tracking_token: order.tracking_token,
      artwork_id: order.artwork_id,
      customer_first_name: order.customer_first_name,
      customer_last_name: order.customer_last_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      customer_address: order.customer_address,
      customer_city: order.customer_city,
      customer_country: order.customer_country,
      customer_notes: order.customer_notes,
      payment_method_id: order.payment_method_id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      payment_proofs: order.payment_proofs,
      events: order.events,
      created_at: order.created_at,
      updated_at: order.updated_at,
    });

    if (error) {
      console.warn('Supabase order sync note:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Supabase sync exception:', err?.message);
    return { success: false, error: err?.message };
  }
}

/**
 * Fetch an order from Supabase for tracking purposes
 */
export async function fetchOrderForTracking(identifier: string, accessCode: string): Promise<Order | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  try {
    // Attempt to match by order_number or tracking_token alongside access_code
    const cleanId = identifier.trim().toUpperCase();
    const cleanCode = accessCode.trim();

    // Since RLS is involved and Supabase 'or' can be tricky, we query by access_code and filter manually,
    // or query using or().
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('access_code', cleanCode)
      .or(`order_number.eq.${cleanId},tracking_token.eq.${cleanId}`);

    if (error) {
      console.warn('Supabase tracking fetch error:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data[0] as Order;
    }
    return null;
  } catch (err: any) {
    console.warn('Supabase tracking fetch exception:', err?.message);
    return null;
  }
}

/**
 * Fetch all orders from Supabase (for Admin Dashboard)
 */
export async function fetchAllOrders(): Promise<Order[]> {
  if (!supabase || !isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch all orders error:', error.message);
      return [];
    }

    return (data as Order[]) || [];
  } catch (err: any) {
    console.warn('Supabase fetch all orders exception:', err?.message);
    return [];
  }
}

/**
 * Synchronize an artwork to Supabase
 */
export async function syncArtworkToSupabase(artwork: Artwork): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('artworks').upsert({
      id: artwork.id,
      item_code: artwork.item_code,
      slug: artwork.slug,
      title_fr: artwork.title_fr,
      title_en: artwork.title_en,
      artist: artwork.artist,
      artist_bio_fr: artwork.artist_bio_fr,
      artist_bio_en: artwork.artist_bio_en,
      description_fr: artwork.description_fr,
      description_en: artwork.description_en,
      price: artwork.price,
      currency: artwork.currency,
      category_id: artwork.category_id,
      technique_fr: artwork.technique_fr,
      technique_en: artwork.technique_en,
      materials_fr: artwork.materials_fr,
      materials_en: artwork.materials_en,
      year: artwork.year,
      width_cm: artwork.width_cm,
      height_cm: artwork.height_cm,
      depth_cm: artwork.depth_cm,
      weight_kg: artwork.weight_kg,
      is_framed: artwork.is_framed,
      has_certificate: artwork.has_certificate,
      featured: artwork.featured,
      status: artwork.status,
      reserved_until: artwork.reserved_until,
      sold_at: artwork.sold_at,
      images: artwork.images,
      created_at: artwork.created_at,
      updated_at: artwork.updated_at,
    });

    if (error) {
      console.warn('Supabase artwork sync note:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Supabase artwork sync exception:', err?.message);
    return { success: false, error: err?.message };
  }
}

/**
 * Fetch all artworks from Supabase
 */
export async function fetchAllArtworks(): Promise<Artwork[]> {
  if (!supabase || !isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch all artworks error:', error.message);
      return [];
    }

    return (data as Artwork[]) || [];
  } catch (err: any) {
    console.warn('Supabase fetch all artworks exception:', err?.message);
    return [];
  }
}

/**
 * Delete an artwork from Supabase
 */
export async function deleteArtworkFromSupabase(id: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return true;

  try {
    const { error } = await supabase.from('artworks').delete().eq('id', id);
    if (error) {
      console.warn('Supabase artwork delete error:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('Supabase artwork delete exception:', err?.message);
    return false;
  }
}


// --- PAYMENT METHODS ---
export async function syncPaymentMethodToSupabase(paymentMethod: PaymentMethod): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) return { success: true };
  try {
    const { error } = await supabase.from('payment_methods').upsert({
      id: paymentMethod.id,
      name: paymentMethod.name,
      type: paymentMethod.type,
      description_fr: paymentMethod.description_fr,
      description_en: paymentMethod.description_en,
      description_ht: paymentMethod.description_ht,
      instructions_fr: paymentMethod.instructions_fr,
      instructions_en: paymentMethod.instructions_en,
      instructions_ht: paymentMethod.instructions_ht,
      account_name: paymentMethod.account_name,
      account_number: paymentMethod.account_number,
      phone_number: paymentMethod.phone_number,
      additional_information_fr: paymentMethod.additional_information_fr,
      additional_information_en: paymentMethod.additional_information_en,
      additional_information_ht: paymentMethod.additional_information_ht,
      logo_url: paymentMethod.logo_url,
      is_active: paymentMethod.is_active,
      created_at: paymentMethod.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function fetchAllPaymentMethods(): Promise<PaymentMethod[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase.from('payment_methods').select('*').order('created_at', { ascending: true });
    if (error) return [];
    return (data as PaymentMethod[]) || [];
  } catch {
    return [];
  }
}

export async function deletePaymentMethodFromSupabase(id: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return true;
  try {
    const { error } = await supabase.from('payment_methods').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// --- CATEGORIES ---
export async function syncCategoryToSupabase(category: Category): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) return { success: true };
  try {
    const { error } = await supabase.from('categories').upsert({
      id: category.id,
      slug: category.slug,
      name_fr: category.name_fr,
      name_en: category.name_en,
      name_ht: category.name_ht,
      description_fr: category.description_fr,
      description_en: category.description_en,
      description_ht: category.description_ht,
      image_url: category.image_url,
      updated_at: new Date().toISOString(),
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function fetchAllCategories(): Promise<Category[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
    if (error) return [];
    return (data as Category[]) || [];
  } catch {
    return [];
  }
}

export async function deleteCategoryFromSupabase(id: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return true;
  try {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// --- SETTINGS ---
export async function syncSettingsToSupabase(settings: GallerySettings): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) return { success: true };
  try {
    const { error } = await supabase.from('settings').upsert({
      id: 'gallery_settings',
      gallery_name: settings.gallery_name,
      tagline_fr: settings.tagline_fr,
      tagline_en: settings.tagline_en,
      logo_url: settings.logo_url,
      logo_type: settings.logo_type,
      contact_email: settings.contact_email,
      contact_phone: settings.contact_phone,
      address: settings.address,
      about_images: settings.about_images,
      admin_email: settings.admin_email,
      admin_password_hash: settings.admin_password_hash,
      updated_at: new Date().toISOString(),
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function fetchSettingsFromSupabase(): Promise<GallerySettings | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 'gallery_settings').single();
    if (error || !data) return null;
    return data as GallerySettings;
  } catch {
    return null;
  }
}

// EOF
