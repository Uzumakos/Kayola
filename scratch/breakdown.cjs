const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/Dan-s/Documents/Kayola/src/pages/AdminDashboardPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

function extractSection(content, startMarker, endMarker) {
  const startIndex = content.indexOf(startMarker);
  const endIndex = endMarker ? content.indexOf(endMarker) : content.indexOf('      {/* DETAIL DRAWER / MODAL FOR SELECTED ORDER */}');
  
  if (startIndex === -1 || endIndex === -1) return null;
  return content.substring(startIndex, endIndex);
}

const tab1 = extractSection(content, "{/* TAB 1: OVERVIEW DASHBOARD */}", "{/* TAB 2: ORDERS MANAGEMENT */}");
const tab2 = extractSection(content, "{/* TAB 2: ORDERS MANAGEMENT */}", "{/* TAB 3: ARTWORKS CRUD */}");
const tab3 = extractSection(content, "{/* TAB 3: ARTWORKS CRUD */}", "{/* TAB 4: CATEGORIES CRUD */}");
const tab4 = extractSection(content, "{/* TAB 4: CATEGORIES CRUD */}", "{/* TAB 5: PAYMENT METHODS CRUD */}");
const tab5 = extractSection(content, "{/* TAB 5: PAYMENT METHODS CRUD */}", "{/* TAB 6: SETTINGS & LOGO IDENTITY */}");
const tab6 = extractSection(content, "{/* TAB 6: SETTINGS & LOGO IDENTITY */}", "{/* DETAIL DRAWER / MODAL FOR SELECTED ORDER */}");

const adminDir = 'c:/Users/Dan-s/Documents/Kayola/src/components/admin';
if (!fs.existsSync(adminDir)) fs.mkdirSync(adminDir, { recursive: true });

function writeComponent(name, jsxContent) {
  if (!jsxContent) {
    console.error(`Skipping ${name}, content not found.`);
    return;
  }
  // Unwrap the conditional rendering wrapper `{activeTab === '...' && (` and `)}`
  const lines = jsxContent.split('\n');
  let cleanJsx = lines.slice(2, lines.length - 2).join('\n'); // Removes the condition and trailing `)}`
  
  const componentStr = `import React from 'react';
import { 
  Plus, Edit2, Trash2, Check, X, Eye, Copy, AlertCircle, Clock, 
  ShieldCheck, CheckCircle2, FileText, DollarSign, Search, 
  ExternalLink, ChevronRight, Building2, Smartphone, Globe, 
  Image as ImageIcon, Link2, Sparkles, Barcode, Hash, QrCode, RotateCcw, Palette, FolderKanban, CreditCard, ShoppingBag, Settings, LogOut, LayoutDashboard
} from 'lucide-react';
import { Artwork, Category, Order, PaymentMethod, GallerySettings } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

export const ${name}: React.FC<any> = (props) => {
  const { 
    t, artworks, categories, paymentMethods, orders, settings,
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
    PRESET_PAYMENT_LOGOS, PRESET_ARTWORK_IMAGES, PRESET_CATEGORY_IMAGES, PRESET_GALLERY_LOGOS,
    locale
  } = props;

  return (
    <>
${cleanJsx}
    </>
  );
};
`;
  fs.writeFileSync(path.join(adminDir, `${name}.tsx`), componentStr);
  console.log(`Created ${name}.tsx`);
}

writeComponent('AdminDashboardOverview', tab1);
writeComponent('AdminOrdersTab', tab2);
writeComponent('AdminArtworksTab', tab3);
writeComponent('AdminCategoriesTab', tab4);
writeComponent('AdminPaymentMethodsTab', tab5);
writeComponent('AdminSettingsTab', tab6);
