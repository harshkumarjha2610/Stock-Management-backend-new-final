const generateBarcodeString = (storeId, productId) => {
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `STR${storeId}-PROD${productId}-${random}`;
};

/**
 * Generate a unique barcode string for a specific product size.
 * Format: STR{storeId}-PROD{productId}-{cleanSize.toUpperCase()}-{random}
 */
const generateSizeBarcodeString = (storeId, productId, size) => {
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  const cleanSize = String(size).replace(/[^a-zA-Z0-9]/g, '');
  return `STR${storeId}-PROD${productId}-${cleanSize.toUpperCase()}-${random}`;
};

module.exports = { generateBarcodeString, generateSizeBarcodeString };
