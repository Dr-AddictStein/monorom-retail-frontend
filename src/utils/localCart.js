const CART_KEY = "monorom_cart";

const makeId = () =>
  `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const getLocalCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("monorom-cart-updated"));
};

export const clearLocalCart = () => {
  saveLocalCart([]);
};

/**
 * Add or merge a product into the local cart.
 * item: { productId, slug, name, image, category, price, qty }
 */
export const addToLocalCart = (item) => {
  const cart = getLocalCart();
  const qty = Math.max(1, Number(item.qty) || 1);
  const existing = cart.find(
    (c) => String(c.productId) === String(item.productId)
  );

  let next;
  if (existing) {
    next = cart.map((c) => {
      if (String(c.productId) !== String(item.productId)) return c;
      const newQty = c.qty + qty;
      return {
        ...c,
        qty: newQty,
        price: item.price ?? c.price,
        name: item.name ?? c.name,
        image: item.image ?? c.image,
        category: item.category ?? c.category,
        slug: item.slug ?? c.slug,
        totalPrice: (item.price ?? c.price) * newQty,
      };
    });
  } else {
    next = [
      ...cart,
      {
        cartId: makeId(),
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        image: item.image,
        category: item.category || "",
        price: item.price,
        qty,
        totalPrice: item.price * qty,
      },
    ];
  }

  saveLocalCart(next);
  return next;
};

/** Replace cart with a single product (Buy Now). */
export const buyNowLocalCart = (item) => {
  const qty = Math.max(1, Number(item.qty) || 1);
  const next = [
    {
      cartId: makeId(),
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      image: item.image,
      category: item.category || "",
      price: item.price,
      qty,
      totalPrice: item.price * qty,
    },
  ];
  saveLocalCart(next);
  return next;
};

export const removeFromLocalCart = (cartId) => {
  const next = getLocalCart().filter((c) => c.cartId !== cartId);
  saveLocalCart(next);
  return next;
};

export const updateLocalCartQty = (cartId, qty) => {
  const next = getLocalCart().map((c) => {
    if (c.cartId !== cartId) return c;
    const newQty = Math.max(1, Number(qty) || 1);
    return { ...c, qty: newQty, totalPrice: c.price * newQty };
  });
  saveLocalCart(next);
  return next;
};

export const getLocalCartCount = () =>
  getLocalCart().reduce((sum, item) => sum + (item.qty || 0), 0);
