import { formatDeliveryPlace, formatOrderAddress } from "../utils/orderAddress";

const OrderAddress = ({ order = {}, showDeliveryPlace = true }) => {
  const homeAddress = String(order.homeAddress || "").trim();
  const thana = String(order.thana || "").trim();
  const district = String(order.district || "").trim();
  const hasParts = Boolean(homeAddress || thana || district);
  const fallback = formatOrderAddress(order);

  return (
    <div className="text-sm">
      {hasParts ? (
        <>
          {homeAddress && <div>{homeAddress}</div>}
          {thana && <div>Thana: {thana}</div>}
          {district && <div>District: {district}</div>}
        </>
      ) : (
        <div>{fallback || "—"}</div>
      )}
      {showDeliveryPlace && order.deliveryPlace && (
        <div className="text-xs text-gray-500 mt-1">
          {formatDeliveryPlace(order.deliveryPlace)}
        </div>
      )}
    </div>
  );
};

export default OrderAddress;
