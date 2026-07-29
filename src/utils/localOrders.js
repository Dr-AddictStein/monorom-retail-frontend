const ORDERS_KEY = "monorom_orders";

export const getLocalOrders = () => {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalOrders = (orders) => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("monorom-orders-updated"));
};

/** Prepend a newly placed order (from DB response) into local history. */
export const addLocalOrder = (order) => {
  const existing = getLocalOrders().filter(
    (o) => String(o._id) !== String(order._id)
  );
  const next = [order, ...existing];
  saveLocalOrders(next);
  return next;
};

export const getLocalOrderById = (id) =>
  getLocalOrders().find((o) => String(o._id) === String(id)) || null;
