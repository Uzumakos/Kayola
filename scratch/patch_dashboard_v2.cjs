const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/Dan-s/Documents/Kayola/src/pages/AdminDashboardPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. ADD IMPORTS
content = content.replace(
  `import { useApp } from '../context/AppContext';`,
  `import { useApp } from '../context/AppContext';
import { AdminLoginView } from '../components/admin/AdminLoginView';
import { AdminDashboardOverview } from '../components/admin/AdminDashboardOverview';
import { AdminOrdersTab } from '../components/admin/AdminOrdersTab';
import { AdminArtworksTab } from '../components/admin/AdminArtworksTab';
import { AdminCategoriesTab } from '../components/admin/AdminCategoriesTab';
import { AdminPaymentMethodsTab } from '../components/admin/AdminPaymentMethodsTab';
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab';`
);

// 2. EXTRACT LOGIN VIEW
const loginStart = content.indexOf(`  // --- 1. ADMIN LOGIN VIEW ---`);
const dashboardStart = content.indexOf(`  // --- 2. ADMIN DASHBOARD VIEW ---`);

if (loginStart > -1 && dashboardStart > -1) {
  content = content.substring(0, loginStart) + 
`  // --- 1. ADMIN LOGIN VIEW ---
  if (!isLoggedIn) {
    return (
      <AdminLoginView 
        t={t} 
        handleLogin={handleLogin} 
        loginPassword={loginPassword} 
        setLoginPassword={setLoginPassword} 
        loginError={loginError} 
      />
    );
  }

` + content.substring(dashboardStart);
}

// 3. EXTRACT TABS
const tab1Start = content.indexOf(`      {/* TAB 1: OVERVIEW DASHBOARD */}`);
const endTabs = content.indexOf(`      {/* DETAIL DRAWER / MODAL FOR SELECTED ORDER */}`);

if (tab1Start > -1 && endTabs > -1) {
  const replacement = `      {/* TAB VIEWS */}
      {activeTab === 'dashboard' && <AdminDashboardOverview {...commonProps} />}
      {activeTab === 'orders' && <AdminOrdersTab {...commonProps} />}
      {activeTab === 'artworks' && <AdminArtworksTab {...commonProps} />}
      {activeTab === 'categories' && <AdminCategoriesTab {...commonProps} />}
      {activeTab === 'payment_methods' && <AdminPaymentMethodsTab {...commonProps} />}
      {activeTab === 'settings' && <AdminSettingsTab {...commonProps} />}

`;

  const propsObj = `
  const commonProps = {
    t, locale, artworks, categories, paymentMethods, orders, settings,
    totalArtworks, availableArtworks, reservedArtworks, paymentsToReview, totalOrders, soldArtworks, totalRevenue,
    orderFilter, setOrderFilter, filteredOrders, setSelectedOrder,
    handleAcceptPayment, setRejectModalOpen, setConfirmSaleModalOpen, handleCopy,
    handleOpenAddArtwork, handleEditArtwork, handleDeleteArtwork, handleToggleArtworkStatus,
    handleOpenAddCategory, handleEditCategory, handleDeleteCategory,
    handleOpenAddPaymentMethod, handleEditPaymentMethod, handleDeletePaymentMethod, handleTogglePaymentMethod,
    logoUrlInput, setLogoUrlInput, galleryNameInput, setGalleryNameInput,
    taglineFrInput, setTaglineFrInput, taglineEnInput, setTaglineEnInput,
    logoImageLoadError, setLogoImageLoadError, previewMode, setPreviewMode,
    handleSaveGallerySettings, handleResetToDefaultLogo,
    PRESET_PAYMENT_LOGOS, PRESET_ARTWORK_IMAGES, PRESET_CATEGORY_IMAGES, PRESET_GALLERY_LOGOS
  };

  // --- 1. ADMIN LOGIN VIEW ---`;

  content = content.replace(`  // --- 1. ADMIN LOGIN VIEW ---`, propsObj);
  
  // Re-calculate tab1Start and endTabs since string length changed!
  const newTab1Start = content.indexOf(`      {/* TAB 1: OVERVIEW DASHBOARD */}`);
  const newEndTabs = content.indexOf(`      {/* DETAIL DRAWER / MODAL FOR SELECTED ORDER */}`);
  
  content = content.substring(0, newTab1Start) + replacement + content.substring(newEndTabs);
}

fs.writeFileSync(filePath, content);
console.log("AdminDashboardPage successfully patched!");
