const fs = require('fs');

const filePath = 'c:/Users/Dan-s/Documents/Kayola/src/pages/AdminDashboardPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Imports
content = content.replace(
  `import { AdminLoginView } from '../components/admin/AdminLoginView';`,
  `import { AdminLoginView } from '../components/admin/AdminLoginView';
import { AdminDashboardOverview } from '../components/admin/AdminDashboardOverview';
import { AdminOrdersTab } from '../components/admin/AdminOrdersTab';
import { AdminArtworksTab } from '../components/admin/AdminArtworksTab';
import { AdminCategoriesTab } from '../components/admin/AdminCategoriesTab';
import { AdminPaymentMethodsTab } from '../components/admin/AdminPaymentMethodsTab';
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab';`
);

const startIndex = content.indexOf("{/* TAB 1: OVERVIEW DASHBOARD */}");
const endIndex = content.indexOf("{/* DETAIL DRAWER / MODAL FOR SELECTED ORDER */}");

if (startIndex > -1 && endIndex > -1) {
  const replacement = `{/* TAB VIEWS */}
      {activeTab === 'dashboard' && <AdminDashboardOverview {...commonProps} />}
      {activeTab === 'orders' && <AdminOrdersTab {...commonProps} />}
      {activeTab === 'artworks' && <AdminArtworksTab {...commonProps} />}
      {activeTab === 'categories' && <AdminCategoriesTab {...commonProps} />}
      {activeTab === 'payment_methods' && <AdminPaymentMethodsTab {...commonProps} />}
      {activeTab === 'settings' && <AdminSettingsTab {...commonProps} />}

      `;
  
  // Insert commonProps object right before the return statement of AdminDashboardPage
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
`;
  content = content.replace(`  // --- 1. ADMIN LOGIN VIEW ---`, propsObj + `\n  // --- 1. ADMIN LOGIN VIEW ---`);
  
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync(filePath, content);
  console.log("AdminDashboardPage updated successfully!");
} else {
  console.error("Could not find replacement boundaries in AdminDashboardPage.");
}
