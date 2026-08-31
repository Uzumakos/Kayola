import re

toast_path = 'src/components/ui/Toast.tsx'
with open(toast_path, 'r', encoding='utf-8') as f:
    toast_content = f.read()

toast_content = toast_content.replace('key={activeToast.id}', 'key={activeToast.id}\n            layout="position"')
with open(toast_path, 'w', encoding='utf-8') as f:
    f.write(toast_content)
    
admin_path = 'src/pages/AdminDashboardPage.tsx'
with open(admin_path, 'r', encoding='utf-8') as f:
    admin_content = f.read()

# For selectedOrder
admin_content = admin_content.replace('          {selectedOrder && (\n            <motion.div\n              initial={{ opacity: 0 }}', '          {selectedOrder && (\n            <motion.div\n              key="detail-modal"\n              initial={{ opacity: 0 }}')
# For rejectModalOpen
admin_content = admin_content.replace('          {rejectModalOpen && selectedOrder && (\n            <motion.div\n              initial={{ opacity: 0 }}', '          {rejectModalOpen && selectedOrder && (\n            <motion.div\n              key="reject-modal"\n              initial={{ opacity: 0 }}')
# For confirmSaleModalOpen
admin_content = admin_content.replace('          {confirmSaleModalOpen && selectedOrder && (\n            <motion.div\n              initial={{ opacity: 0 }}', '          {confirmSaleModalOpen && selectedOrder && (\n            <motion.div\n              key="confirm-sale-modal"\n              initial={{ opacity: 0 }}')
# For artworkModalOpen
admin_content = admin_content.replace('          {artworkModalOpen && editingArtwork && (\n            <motion.div\n              initial={{ opacity: 0 }}', '          {artworkModalOpen && editingArtwork && (\n            <motion.div\n              key="artwork-modal"\n              initial={{ opacity: 0 }}')
# For paymentModalOpen
admin_content = admin_content.replace('          {paymentModalOpen && editingPaymentMethod && (\n            <motion.div\n              initial={{ opacity: 0 }}', '          {paymentModalOpen && editingPaymentMethod && (\n            <motion.div\n              key="payment-method-modal"\n              initial={{ opacity: 0 }}')
# For categoryModalOpen
admin_content = admin_content.replace('          {categoryModalOpen && editingCategory && (\n            <motion.div\n              initial={{ opacity: 0 }}', '          {categoryModalOpen && editingCategory && (\n            <motion.div\n              key="category-modal"\n              initial={{ opacity: 0 }}')

with open(admin_path, 'w', encoding='utf-8') as f:
    f.write(admin_content)
