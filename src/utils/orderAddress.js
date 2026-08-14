export const DELIVERY_CHARGES = {
  inside_dhaka: 80,
  outside_dhaka: 120,
};

export const getDeliveryCharge = (deliveryPlace) =>
  DELIVERY_CHARGES[deliveryPlace] ?? 0;

export const formatDeliveryPlace = (deliveryPlace) => {
  if (deliveryPlace === "inside_dhaka") return "Inside Dhaka";
  if (deliveryPlace === "outside_dhaka") return "Outside Dhaka";
  return deliveryPlace || "";
};

export const formatOrderAddress = (order = {}) => {
  const parts = [order.homeAddress, order.thana, order.district]
    .map((part) => String(part || "").trim())
    .filter(Boolean);

  if (parts.length) return parts.join(", ");
  return order.address || order.shippingAddress || "";
};

export const composeAddress = (homeAddress, thana, district) =>
  [homeAddress, thana, district]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(", ");
