const fs = require('fs');
const path = require('path');

const adminDir = 'c:/Users/Dan-s/Documents/Kayola/src/components/admin';
const dashPath = 'c:/Users/Dan-s/Documents/Kayola/src/pages/AdminDashboardPage.tsx';

// 1. Update AdminDashboardPage.tsx commonProps
let dashContent = fs.readFileSync(dashPath, 'utf8');

const newProps = `
  const commonProps = {
    store, navigate, openLightbox, toast,
    t, locale, artworks, categories, paymentMethods, orders, settings,
    totalArtworks, availableArtworks, reservedArtworks, paymentsToReview, totalOrders, soldArtworks, totalRevenue,
    orderFilter, setOrderFilter, filteredOrders, setSelectedOrder, selectedOrder, rejectionReason, setRejectionReason,
    handleAcceptPayment, handleRejectPayment, handleConfirmSale, setRejectModalOpen, setConfirmSaleModalOpen, handleCopy,
    setArtworkModalOpen, setEditingArtwork, setArtworkImageLoadError,
    setCategoryModalOpen, setEditingCategory, setCategoryImageLoadError,
    setPaymentModalOpen, setEditingPaymentMethod, setImageLoadError,
    handleDeleteArtwork: (id) => store.deleteArtwork(id),
    handleDeleteCategory: (id) => store.deleteCategory(id),
    handleDeletePaymentMethod: (id) => store.deletePaymentMethod(id),
    handleTogglePaymentMethod: (id) => store.togglePaymentMethodStatus(id),
    logoUrlInput, setLogoUrlInput, galleryNameInput, setGalleryNameInput,
    taglineFrInput, setTaglineFrInput, taglineEnInput, setTaglineEnInput,
    logoImageLoadError, setLogoImageLoadError, previewMode, setPreviewMode,
    handleSaveGallerySettings, handleResetToDefaultLogo,
    PRESET_PAYMENT_LOGOS, PRESET_ARTWORK_IMAGES, PRESET_CATEGORY_IMAGES, PRESET_GALLERY_LOGOS
  };
`;

dashContent = dashContent.replace(/const commonProps = \{[\s\S]*?\};/, newProps.trim());
fs.writeFileSync(dashPath, dashContent);

// 2. Update the 6 component files to just import store if needed or use props
const components = fs.readdirSync(adminDir).filter(f => f.endsWith('.tsx') && f !== 'AdminLoginView.tsx');

for (const comp of components) {
  const filePath = path.join(adminDir, comp);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the destructuring block
  const destructRegex = /const \{[\s\S]*?\} = props;/;
  
  const newDestruct = `const { 
    store, navigate, openLightbox, toast,
    t, locale, artworks, categories, paymentMethods, orders, settings,
    totalArtworks, availableArtworks, reservedArtworks, paymentsToReview, totalOrders, soldArtworks, totalRevenue,
    orderFilter, setOrderFilter, filteredOrders, setSelectedOrder, selectedOrder, rejectionReason, setRejectionReason,
    handleAcceptPayment, handleRejectPayment, handleConfirmSale, setRejectModalOpen, setConfirmSaleModalOpen, handleCopy,
    setArtworkModalOpen, setEditingArtwork, setArtworkImageLoadError,
    setCategoryModalOpen, setEditingCategory, setCategoryImageLoadError,
    setPaymentModalOpen, setEditingPaymentMethod, setImageLoadError,
    handleDeleteArtwork, handleDeleteCategory, handleDeletePaymentMethod, handleTogglePaymentMethod,
    logoUrlInput, setLogoUrlInput, galleryNameInput, setGalleryNameInput,
    taglineFrInput, setTaglineFrInput, taglineEnInput, setTaglineEnInput,
    logoImageLoadError, setLogoImageLoadError, previewMode, setPreviewMode,
    handleSaveGallerySettings, handleResetToDefaultLogo,
    PRESET_PAYMENT_LOGOS, PRESET_ARTWORK_IMAGES, PRESET_CATEGORY_IMAGES, PRESET_GALLERY_LOGOS
  } = props;`;

  content = content.replace(destructRegex, newDestruct);
  
  // Quick fix: Add import for store just in case
  if (!content.includes('import { store }')) {
    content = content.replace(`import { StatusBadge } from '../ui/StatusBadge';`, `import { StatusBadge } from '../ui/StatusBadge';\nimport { store } from '../../lib/store';`);
  }
  
  fs.writeFileSync(filePath, content);
  console.log('Fixed', comp);
}
