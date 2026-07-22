import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";
import { FaSearch } from "react-icons/fa";

const CompletedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter orders based on search term
  const filteredOrders = orders.filter(order =>
    order?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/order/getAllCompeltedOrders`
      );
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching received orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (orderId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/order/deleteOrder/${orderId}`
      );
      fetchOrders(); // Refetch orders after marking one as completed
    } catch (error) {
      console.error("Error marking order as completed:", error);
    }
  };


  const { user } = useAuthContext();
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

  if (user?.user?.role !== "admin") {
    return (
      <div className="h-[100vh] flex flex-col justify-center">
        <div className="text-5xl text-center">
          Access Denied.!.
        </div>
        <div className="text-2xl text-center pt-5">
          This page can only be accessed by the Admin
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Completed Orders</h2>
      
      {/* Search Bar */}
      <div className="w-full max-w-md mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by company name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto w-full max-w-6xl">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm">
              <th className="p-4 text-center">Company Name</th>
              <th className="p-4 text-center">Phone</th>
              <th className="p-4 text-center">Total Cost</th>
              <th className="p-4 text-center">Shipping Address</th>
              <th className="p-4 text-center">Date</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  {searchTerm ? `No orders found for "${searchTerm}"` : "No orders found"}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-100">
                  <td className="p-4 text-center">{order.companyName}</td>
                  <td className="p-4 text-center">{order.phone}</td>
                  <td className="p-4 text-center">
                    {parseFloat(order.totalCost).toFixed(2)}/-
                  </td>
                  <td className="p-4 text-center">{order.address}</td>
                  <td className="p-4 text-center">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <Link
                      className="btn btn-primary mr-2"
                      to={"/dashboard/admin/orderDetails/" + order._id}
                    >
                      View
                    </Link>
                    <button
                      className="btn bg-red-600 text-white ml-1"
                      onClick={() => handleDelete(order._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden w-full max-w-2xl space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">
              {searchTerm ? `No orders found for "${searchTerm}"` : "No orders found"}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="space-y-3">
              {/* Company Name */}
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-500">Company Name</span>
                <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                  {order.companyName}
                </span>
              </div>

              {/* Phone */}
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-500">Phone</span>
                <span className="text-sm text-gray-900">{order.phone}</span>
              </div>

              {/* Total Cost */}
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-500">Total Cost</span>
                <span className="text-sm font-bold text-green-600">
                  {parseFloat(order.totalCost).toFixed(2)}/-
                </span>
              </div>

              {/* Shipping Address */}
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-500">Address</span>
                <span className="text-sm text-gray-900 text-right max-w-[60%]">
                  {order.address}
                </span>
              </div>

              {/* Date */}
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-500">Date</span>
                <span className="text-sm text-gray-900">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex flex-col gap-2">
                  <Link
                    className="w-full btn btn-primary btn-sm"
                    to={"/dashboard/admin/orderDetails/" + order._id}
                  >
                    View Details
                  </Link>
                  <button
                    className="w-full btn bg-red-600 text-white btn-sm"
                    onClick={() => handleDelete(order._id)}
                  >
                    Delete Order
                  </button>
                </div>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CompletedOrders;
