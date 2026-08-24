import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale } from '../types';
import { translations } from '../i18n/translations';

interface ToastInfo {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface AppContextType {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: (typeof translations)['fr'] | (typeof translations)['en'];
  currentPath: string;
  navigate: (path: string) => void;
  toast: (message: string, type?: 'success' | 'info' | 'error') => void;
  activeToast: ToastInfo | null;
  selectedImageForLightbox: string | null;
  openLightbox: (imageUrl: string) => void;
  closeLightbox: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname === '/' || pathname === '') {
        return '/fr';
      }
      return pathname;
    }
    return '/fr';
  });

  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/en')) return 'en';
      return 'fr'; // default French
    }
    return 'fr';
  });

  const [activeToast, setActiveToast] = useState<ToastInfo | null>(null);
  const [selectedImageForLightbox, setSelectedImageForLightbox] = useState<string | null>(null);

  // Sync route on popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      let pathname = window.location.pathname;
      if (pathname === '/' || pathname === '') pathname = '/fr';
      setCurrentPath(pathname);

      if (pathname.startsWith('/en')) {
        setLocaleState('en');
        document.documentElement.lang = 'en';
      } else if (pathname.startsWith('/fr')) {
        setLocaleState('fr');
        document.documentElement.lang = 'fr';
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update initial URL if root '/'
  useEffect(() => {
    if (window.location.pathname === '/' || window.location.pathname === '') {
      window.history.replaceState({}, '', '/fr');
    }
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (path.startsWith('/en')) {
      setLocaleState('en');
      document.documentElement.lang = 'en';
    } else if (path.startsWith('/fr')) {
      setLocaleState('fr');
      document.documentElement.lang = 'fr';
    }
  };

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    document.documentElement.lang = newLocale;

    // Switch current path prefix
    if (currentPath.startsWith('/fr') && newLocale === 'en') {
      const newPath = currentPath.replace(/^\/fr/, '/en');
      navigate(newPath);
    } else if (currentPath.startsWith('/en') && newLocale === 'fr') {
      const newPath = currentPath.replace(/^\/en/, '/fr');
      navigate(newPath);
    }
  };

  const toast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString();
    setActiveToast({ id, message, type });
    setTimeout(() => {
      setActiveToast((current) => (current?.id === id ? null : current));
    }, 4000);
  };

  const openLightbox = (imageUrl: string) => setSelectedImageForLightbox(imageUrl);
  const closeLightbox = () => setSelectedImageForLightbox(null);

  const t = translations[locale] || translations.fr;

  return (
    <AppContext.Provider
      value={{
        locale,
        setLocale,
        t,
        currentPath,
        navigate,
        toast,
        activeToast,
        selectedImageForLightbox,
        openLightbox,
        closeLightbox,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
