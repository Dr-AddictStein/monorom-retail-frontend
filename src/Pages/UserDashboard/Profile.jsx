import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../../hooks/useAuthContext";
import { uploadFile } from "../../utils/uploadFile";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "@/config";

const Profile = () => {
  const { user } = useAuthContext();
  const [userData, setUserData] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    phone: "",
    city: "",
    shippingAddress: "",
    homeAddress: "",
    thana: "",
    district: "",
    companyName: "",
    role: "",
    image: "",
    dob: "",
  });
  const [imageFile, setImageFile] = useState(null);

  // Function to upload the file and return the file path

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/user/getSingleUser/${user?.user?._id
        }`
      );
      setUserData({
        ...response.data.data,
        homeAddress:
          response.data.data.homeAddress ||
          response.data.data.shippingAddress ||
          "",
        thana: response.data.data.thana || "",
        district: response.data.data.district || "",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  useEffect(() => {
    if (user?.user?._id) {
      fetchUserData();
    }
  }, [user?.user?._id]);

  const [dob, setDateOfBirth] = useState('');

  const handleDateChange = (e) => {
    const isoDate = e.target.value; // Format: yyyy-mm-dd
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`; // Convert to dd/mm/yyyy
  };
  const formatDateForInput = (dateString) => {
    if (!dateString) return ""; // Handle empty or undefined dates

    const [day, month, year] = dateString.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const handleInputChange = (e) => {
    if (e.target.name === "dob") {
      setUserData({ ...userData, [e.target.name]: handleDateChange(e) });
    }
    else {
      setUserData({ ...userData, [e.target.name]: e.target.value });
    }
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = userData.image;
    if (imageFile) {
      imageUrl = await uploadFile(imageFile);
    }

    const updatedUserData = { ...userData, image: imageUrl };

    try {
      await axios.patch(
        `${BACKEND_URL}/api/user/updateUser/${user?.user?._id
        }`,
        updatedUserData
      );
      toast.success("Profile updated successfully!");
      fetchUserData();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center gap-6 px-4 sm:px-6 lg:px-8">
        <div className="text-3xl sm:text-4xl md:text-5xl text-center">You are Not Logged in!</div>
        <div className="text-xl sm:text-2xl md:text-3xl text-center">Please Sign Up</div>
        <div className="flex justify-center gap-3">
          <Link to={'/login'} className="px-3 py-2 bg-emerald-700 rounded-md text-white text-base sm:text-lg">
            <button>Login</button>
          </Link>
          <Link to={'/signup'} className="px-3 py-2 bg-slate-700 rounded-md text-white text-base sm:text-lg">
            <button>SignUp</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ToastContainer />
      <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4 py-8 sm:px-6 md:py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-4xl bg-white shadow-lg p-4 sm:p-6 md:p-8 rounded-lg"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4 sm:mb-6 text-center">
            Profile
          </h2>

          {/* Display current profile picture */}
          {userData.image && (
            <div className="flex justify-center mb-4 sm:mb-6">
              <img
                src={userData.image}
                alt="Profile"
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover rounded-full"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-gray-600 font-medium mb-1 sm:mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={userData.firstName}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1 sm:mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={userData.lastName}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1 sm:mb-2">
                Username
              </label>
              <input
                type="text"
                name="userName"
                value={userData.userName}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1 sm:mb-2">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={userData.phone}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1 sm:mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={userData.city}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-gray-600 font-medium mb-1 sm:mb-2">
                Home Address
              </label>
              <textarea
                name="homeAddress"
                value={userData.homeAddress}
                onChange={handleInputChange}
                rows={2}
                className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1 sm:mb-2">
                Thana
              </label>
              <input
                type="text"
                name="thana"
                value={userData.thana || ""}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1 sm:mb-2">
                District
              </label>
              <input
                type="text"
                name="district"
                value={userData.district || ""}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1 sm:mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={userData.companyName}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col justify-center items-start mb-2 sm:mb-4 w-full">
              <label htmlFor="dob" className="mb-1 sm:mb-2 font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                name="dob"
                type="date"
                value={formatDateForInput(userData.dob)} // Convert the date for the input field
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-gray-600 font-medium mb-1 sm:mb-2">
                Profile Image
              </label>
              <input
                type="file"
                name="image"
                onChange={handleImageChange}
                className="w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              />
            </div>
          </div>

          <div className="text-center mt-4 sm:mt-6">
            <button
              type="submit"
              className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
