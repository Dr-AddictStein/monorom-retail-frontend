/**
 * Resolve a product's single selling price.
 * Falls back to legacy tier fields for older products that have not been re-saved yet.
 */
export const getProductPrice = (product) => {
  if (product?.price != null && product.price !== "") return Number(product.price);
  if (product?.priceFC != null) return Number(product.priceFC);
  if (product?.priceSC != null) return Number(product.priceSC);
  if (product?.priceMC != null) return Number(product.priceMC);
  if (product?.priceBC != null) return Number(product.priceBC);
  return 0;
};
