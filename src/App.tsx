import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { store } from './lib/store';
import { fetchAllArtworks, fetchAllCategories, fetchAllPaymentMethods, fetchSettingsFromSupabase } from './lib/supabase';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Lightbox } from './components/ui/Lightbox';
import { Toast } from './components/ui/Toast';

// Pages
import { HomePage } from './pages/HomePage';
import { GalleryPage } from './pages/GalleryPage';
import { ArtworkDetailPage } from './pages/ArtworkDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const AppContent: React.FC = () => {
  const { currentPath, locale, lightboxImage, closeLightbox, toastMessage, hideToast } = useApp();

  // Fetch all data from Supabase on initial load
  useEffect(() => {
    fetchAllArtworks().then((remoteArtworks) => {
      if (remoteArtworks.length > 0) store.mergeArtworks(remoteArtworks);
    });
    
    fetchAllCategories().then((remoteCategories) => {
      if (remoteCategories.length > 0) store.mergeCategories(remoteCategories);
    });

    fetchAllPaymentMethods().then((remotePaymentMethods) => {
      if (remotePaymentMethods.length > 0) store.mergePaymentMethods(remotePaymentMethods);
    });

    fetchSettingsFromSupabase().then((remoteSettings) => {
      if (remoteSettings) store.mergeSettings(remoteSettings);
    });
  }, []);

  // Simple, elegant client-side path dispatcher
  const renderRoute = () => {
    // Normalize path (strip trailing slashes)
    const path = currentPath.replace(/\/$/, '') || `/${locale}`;

    // Admin Routes
    if (path === '/admin' || path.startsWith('/admin/')) {
      return <AdminDashboardPage />;
    }

    // Locale-prefixed routes (e.g. /fr, /en, /fr/gallery, /en/gallery, etc.)
    const localizedPath = path.replace(/^\/(fr|en|ht)/, '') || '/';

    if (localizedPath === '/' || localizedPath === '') {
      return <HomePage />;
    }

    if (localizedPath === '/gallery') {
      return <GalleryPage />;
    }

    if (localizedPath.startsWith('/artwork/')) {
      const slug = localizedPath.replace('/artwork/', '');
      return <ArtworkDetailPage slug={slug} />;
    }

    if (localizedPath.startsWith('/checkout/')) {
      const artworkId = localizedPath.replace('/checkout/', '');
      return <CheckoutPage artworkId={artworkId} />;
    }

    if (localizedPath.startsWith('/order/track')) {
      const token = localizedPath.replace('/order/track', '').replace(/^\//, '');
      return <OrderTrackingPage tokenParam={token || undefined} />;
    }

    if (localizedPath === '/about') {
      return <AboutPage />;
    }

    if (localizedPath === '/contact') {
      return <ContactPage />;
    }

    // Fallback to Home if unknown route
    return <HomePage />;
  };

  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#171717] selection:bg-[#EF5A33]/20 selection:text-[#EF5A33]">
      {!isAdminRoute && <Navbar />}

      <main className="flex-1">
        {renderRoute()}
      </main>

      {!isAdminRoute && <Footer />}

      {/* Global Image Lightbox */}
      <Lightbox
        isOpen={Boolean(lightboxImage)}
        imageUrl={lightboxImage || ''}
        onClose={closeLightbox}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
