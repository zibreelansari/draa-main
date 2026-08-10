exports.validatePurchaseType = (book, purchaseType) => {
  if (!book) return false;

  if (purchaseType ==='pdftype') {
    return book.digitalPrice > 0;
  }

  if (purchaseType ==='paperback') {
    return book.physicalPrice > 0;
  }

  if (purchaseType ==='both(ppt+pdf)') {
    return book.digitalPrice > 0 && book.physicalPrice > 0;
  }

  return false;
};

exports.resolveAmountByType = (book, purchaseType) => {
  if (purchaseType ==='pdftype') return book.digitalPrice;
  if (purchaseType ==='paperback') return book.physicalPrice;
  if (purchaseType ==='both(ppt+pdf)')
    return book.digitalPrice + book.physicalPrice;
  return 0;
};

exports.requiresDelivery = (purchaseType) => {
  return purchaseType ==='paperback' || purchaseType ==='both(ppt+pdf)';
};