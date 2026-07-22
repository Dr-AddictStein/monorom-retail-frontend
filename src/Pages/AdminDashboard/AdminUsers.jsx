import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";

const Table = ({ data, rowsPerPage }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermPhone, setSearchTermPhone] = useState("");
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const filteredData = data.filter((user) =>
    user?.userName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (searchTermPhone === "" || (user.phone && user.phone.includes(searchTermPhone)))
  );

  const paginateData = filteredData.slice(
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
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/${id}`
        );
        window.location.reload();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  const switchRole = async (id) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/switchRole/${id}`
      );
      window.location.reload();
    } catch (error) {
      console.error("Error switching role:", error);
      alert("Failed to switch role. Please try again.");
    }
  };

  const switchPermission = async (id) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/switchPermission/${id}`
      );
      window.location.reload();
    } catch (error) {
      console.error("Error switching permission:", error);
      alert("Failed to switch permission. Please try again.");
    }
  };

  const handleViewChange = async (id, newView) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/changeView/${id}`,
        { view: newView }
      );
      alert("User view updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error changing user view:", error);
      alert("Failed to change user view. Please try again.");
    }
  };

  const { user } = useAuthContext();
  if (!user) {
    return (
      <div className="h-[100vh] flex flex-col justify-center gap-10">
        <div className="text-5xl text-center">You are Not Logged in!</div>
        <div className="text-3xl text-center">Please Sign Up</div>
        <div className="flex justify-center gap-3">
          <Link
            to={"/login"}
            className="px-3 py-2 bg-emerald-700 rounded-md text-xl text-white"
          >
            <button>Login</button>
          </Link>
          <Link
            to={"/signup"}
            className="px-3 py-2 bg-slate-700 rounded-md text-xl text-white"
          >
            <button>SignUp</button>
          </Link>
        </div>
      </div>
    );
  }

  if (user?.user?.role !== "admin") {
    return (
      <div className="h-[100vh] flex flex-col justify-center">
        <div className="text-5xl text-center">Access Denied!</div>
        <div className="text-2xl text-center pt-5">
          This page can only be accessed by the Admin
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
        User Management
      </h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Phone Number"
          value={searchTermPhone}
          onChange={(e) => setSearchTermPhone(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
              <th className="p-4 text-center">Serial No.</th>
              <th className="p-4 text-center">Image</th>
              <th className="p-4 text-center">Full Name</th>
              <th className="p-4 text-center">Company</th>
              <th className="p-4 text-center">Username</th>
              <th className="p-4 text-center">Phone</th>
              <th className="p-4 text-center">City</th>
              <th className="p-4 text-center">Date of Birth</th>
              <th className="p-4 text-center">Role</th>
              <th className="p-4 text-center">View</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginateData.map((user, index) => (
              <tr key={user._id} className="border-b hover:bg-gray-100">
                <td className="p-4 text-center">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                <td className="p-4">
                  <img
                    src={user.image}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-12 h-12 rounded-full"
                  />
                </td>
                <td className="p-4 text-center">
                  {user.firstName} {user.lastName}
                </td>
                <td className="p-4 text-center">{user.companyName || "N/A"}</td>
                <td className="p-4 text-center">{user.userName}</td>
                <td className="p-4 text-center">{user.phone}</td>
                <td className="p-4 text-center">{user.city}</td>
                <td className="p-4 text-center">{user?.dob || "Not given"}</td>
                <td className="p-4 text-center">{user.role}</td>
                <td className="p-4 text-center">
                  <select
                    value={user.userView || "BC"} // Default to "BC" if no value is set
                    onChange={(e) =>
                      handleViewChange(user._id, e.target.value)
                    }
                    className="border border-gray-300 rounded-lg p-2"
                  >
                    <option value="BC">BC</option>
                    <option value="MC">MC</option>
                    <option value="SC">SC</option>
                    <option value="FC">FC</option>
                  </select>
                </td>
                <td className="p-4 text-center flex gap-2">
                  {user.role !== "admin" && (
                    <button
                      onClick={() => switchRole(user._id)}
                      className="bg-cyan-500 text-white rounded-lg p-2"
                    >
                      Make Admin
                    </button>
                  )}
                  {user.role !== "user" && (
                    <button
                      onClick={() => switchRole(user._id)}
                      className="bg-green-500 text-white rounded-lg p-2"
                    >
                      Make User
                    </button>
                  )}
                  {user.role === "user" && user.permission && (
                    <button
                      onClick={() => switchPermission(user._id)}
                      className="bg-red-500 text-white rounded-lg p-2"
                    >
                      Remove Permission
                    </button>
                  )}
                  {user.role === "user" && !user.permission && (
                    <button
                      onClick={() => switchPermission(user._id)}
                      className="bg-green-500 text-white rounded-lg p-2"
                    >
                      Grant Permission
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {Math.ceil(filteredData.length / rowsPerPage)}
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

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const rowsPerPage = 10;

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/getAllUser`
      );
      setUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start">
      <Table data={users} rowsPerPage={rowsPerPage} />
    </div>
  );
};

export default AdminUsers;
