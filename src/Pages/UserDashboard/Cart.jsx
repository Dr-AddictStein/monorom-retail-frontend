import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../../hooks/useAuthContext";
import Modal from "./Modal"; // Import the Modal component

const Table = ({ data, rowsPerPage, onDelete, setIsModalOpen }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / rowsPerPage);

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
        toast.success("Product deleted successfully!");
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Error deleting product. Please try again.");
      }
    }
  };

  return (
    <div className="w-full p-6 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
        My Cart
      </h2>
      <div className="overflow-x-auto">
        <div className="flex flex-col justify-center">
          <table className="min-w-full bg-white rounded-lg shadow">
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
                <tr key={index} className="border-b hover:bg-gray-100">
                  <td className="p-4">{index + 1}</td>
                  <td className="p-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover"
                    />
                  </td>
                  <td className="p-4 text-center">{item.name}</td>
                  <td className="p-4 text-center">{item.category}</td>
                  <td className="p-4 text-center">tk {item.price.toFixed(2)}/-</td>
                  <td className="p-4 text-center">x{item.qty}</td>
                  <td className="p-4 text-center">tk {item.totalPrice.toFixed(2)}/-</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <Link to={`/productDetails/${item.productId}`}>
                        <button className="btn btn-primary">View</button>
                      </Link>
                      <button
                        className="btn bg-red-600 text-white"
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
      </div>
      {/* Total Cost */}
      {data.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-lg font-semibold">
            Total Cost: $
            {data.reduce((total, item) => total + item.totalPrice, 0).toFixed(2)}
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Make the Order
          </button>
        </div>
      )}
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const Cart = () => {
  const { user } = useAuthContext();
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    companyName: "",
    requirements: ""
  });

  const navigate=useNavigate();

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart/getCartByUserId/${user?.user?._id
        }`
      );
      setData(response.data);
      setOrderDetails({
        name: user?.user?.firstName + ' ' + user?.user?.lastName,
        phone: user?.user?.phone,
        email: "",
        address: user?.user?.shippingAddress,
        companyName: user?.user?.companyName,
      })
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/cart/${id}`);
      fetchData();
    } catch (error) {
      throw new Error("Error deleting product.");
    }
  };

  const handleOrderSubmit = async () => {
    try {
      const totalCost = data
        .reduce((total, item) => total + item.totalPrice, 0)
        .toFixed(2); // Calculate total cost
      const orderData = {
        userId: user?.user?._id,
        cartData: data,
        totalCost, // Include total cost
        status: "received",
        ...orderDetails,
      };
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/order/createOrder`,
        orderData
      );
      console.log("Happy.!.", orderData);
      toast.success("Order placed successfully!");
      setIsModalOpen(false);
      fetchData(); // Optionally refresh cart data after order
      setOrderDetails({ name: "", phone: "", email: "", address: "", companyName: "", requirements: "" }); // Reset form
      navigate('/dashboard/user/orderHistory');
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place the order. Please try again.");
    }
  };

  useEffect(() => {
    if (user?.user?._id) {
      fetchData();
    }
  }, [user?.user?._id]);


  if (!user) {
    return (
      <div className="h-[100vh] flex flex-col justify-center gap-10">
        <div className="text-5xl text-center">You are Not Logged in.!.</div>
        <div className="text-3xl text-center">Please Sign Up</div>
        <div className="flex justify-center gap-3">
          <Link to={'/login'} className="px-3 py-2 bg-emerald-700 rounded-md text-xl text-white">
            <button>Login</button>
          </Link>
          <Link to={'/signup'} className="px-3 py-2 bg-slate-700 rounded-md text-xl text-white">
            <button>SignUp</button>
          </Link>
        </div>
      </div>
    );
  }



  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100">
      <ToastContainer />
      <div className="w-full max-w-6xl">
        <Table
          data={data}
          rowsPerPage={10}
          onDelete={handleDeleteProduct}
          setIsModalOpen={() => setIsModalOpen(true)}
        />
      </div>

      {/* Modal for Order Details */}
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
                setOrderDetails({ ...orderDetails, companyName: e.target.value })
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
                setOrderDetails({ ...orderDetails, requirements: e.target.value })
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
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Place Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Cart;
