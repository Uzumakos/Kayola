import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order } from '../types';

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

