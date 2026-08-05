import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useCart } from "../../context/CartContext";
import { addLocalOrder } from "../../utils/localOrders";
import Modal from "./Modal";

const Table = ({ data, rowsPerPage, onDelete, setIsModalOpen }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));

  const paginateData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to remove this product from your Cart?"
      )
    ) {
      try {
        await onDelete(id);
        toast.success("Product removed from cart!");
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Error removing product. Please try again.");
      }
    }
  };

  return (
    <div className="w-full p-4 md:p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
        My Cart
      </h2>
      {data.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-4">Your cart is empty.</p>
          <Link
            to="/allProducts"
            className="inline-block px-6 py-2.5 bg-gray-900 text-white hover:bg-white hover:text-gray-900 border border-gray-900 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
                  <th className="p-4 text-center">ID</th>
                  <th className="p-4 text-center">Image</th>
                  <th className="p-4 text-center">Name</th>
                  <th className="p-4 text-center">Category</th>
                  <th className="p-4 text-center">Price</th>
                  <th className="p-4 text-center">Quantity</th>
                  <th className="p-4 text-center">Total Price</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginateData.map((item, index) => (
                  <tr key={item.cartId} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-center">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="p-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover mx-auto"
                      />
                    </td>
                    <td className="p-4 text-center">{item.name}</td>
                    <td className="p-4 text-center">{item.category}</td>
                    <td className="p-4 text-center">Tk. {Number(item.price).toFixed(2)}</td>
                    <td className="p-4 text-center">x{item.qty}</td>
                    <td className="p-4 text-center">
                      Tk. {Number(item.totalPrice).toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Link to={`/productDetails/${item.slug || item.productId}`}>
                          <button
                            type="button"
                            className="px-3 py-1.5 bg-gray-900 text-white text-sm hover:bg-gray-700"
                          >
                            View
                          </button>
                        </Link>
                        <button
                          type="button"
                          className="px-3 py-1.5 bg-red-600 text-white text-sm hover:bg-red-700"
                          onClick={() => handleDelete(item.cartId)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <span className="text-lg font-semibold text-gray-900">
              Total Cost: Tk.{" "}
              {data
                .reduce((total, item) => total + Number(item.totalPrice), 0)
                .toFixed(2)}
            </span>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2.5 bg-gray-900 text-white border border-gray-900 hover:bg-white hover:text-gray-900 transition-colors"
            >
              Make the Order
            </button>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-900 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-900 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const Cart = () => {
  const { user } = useAuthContext();
  const { cart, removeItem, clear, refresh } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    companyName: "",
    requirements: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (user?.user) {
      setOrderDetails((prev) => ({
        ...prev,
        name:
          prev.name ||
          `${user.user.firstName || ""} ${user.user.lastName || ""}`.trim(),
        phone: prev.phone || user.user.phone || "",
        address: prev.address || user.user.shippingAddress || "",
        companyName: prev.companyName || user.user.companyName || "",
      }));
    }
  }, [user?.user]);

  const handleDeleteProduct = async (cartId) => {
    removeItem(cartId);
  };

  const handleOrderSubmit = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    try {
      const totalCost = cart
        .reduce((total, item) => total + Number(item.totalPrice), 0)
        .toFixed(2);

      const orderData = {
        userId: user?.user?._id || "guest",
        cartData: cart,
        totalCost,
        status: "received",
        ...orderDetails,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/order/createOrder`,
        orderData
      );

      const savedOrder = response.data;
      addLocalOrder(savedOrder);
      clear();

      toast.success("Order placed successfully!");
      setIsModalOpen(false);
      setOrderDetails({
        name: "",
        phone: "",
        email: "",
        address: "",
        companyName: "",
        requirements: "",
      });
      navigate("/user/orderHistory");
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place the order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 pt-32 md:pt-40 pb-16 px-4">
      <ToastContainer />
      <div className="w-full max-w-6xl">
        <Table
          data={cart}
          rowsPerPage={10}
          onDelete={handleDeleteProduct}
          setIsModalOpen={setIsModalOpen}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-2xl font-semibold mb-4">Order Details</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleOrderSubmit();
          }}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={orderDetails.name}
              onChange={(e) =>
                setOrderDetails({ ...orderDetails, name: e.target.value })
              }
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              value={orderDetails.companyName}
              onChange={(e) =>
                setOrderDetails({
                  ...orderDetails,
                  companyName: e.target.value,
                })
              }
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              value={orderDetails.phone}
              onChange={(e) =>
                setOrderDetails({ ...orderDetails, phone: e.target.value })
              }
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Email (optional)
            </label>
            <input
              type="email"
              value={orderDetails.email}
              onChange={(e) =>
                setOrderDetails({ ...orderDetails, email: e.target.value })
              }
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Full Shipping Address
            </label>
            <textarea
              value={orderDetails.address}
              onChange={(e) =>
                setOrderDetails({ ...orderDetails, address: e.target.value })
              }
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Requirements
            </label>
            <textarea
              value={orderDetails.requirements}
              onChange={(e) =>
                setOrderDetails({
                  ...orderDetails,
                  requirements: e.target.value,
                })
              }
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter any special requirements or notes for your order..."
              rows={3}
            />
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              {submitting ? "Placing..." : "Place Order"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Cart;
