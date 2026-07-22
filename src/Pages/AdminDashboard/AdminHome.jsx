import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../../hooks/useAuthContext";

const AdminHome = () => {
  const [logo, setLogo] = useState("");
  const [homeBanner, setHomeBanner] = useState("");
  const [homeSlogan, setHomeSlogan] = useState("");
  const [homeSmallText, setHomeSmallText] = useState("");
  const [loginBanner, setLoginBanner] = useState("");
  const [signUpBanner, setSignUpBanner] = useState("");

  // Fetch current site data on component mount
  useEffect(() => {
    const fetchSiteData = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/siteData/getSiteData`
      );
      const data = await response.json();
      setLogo(data.logo);
      setHomeBanner(data.homeBanner);
      setHomeSlogan(data.homeSlogan);
      setHomeSmallText(data.homeSmallText);
      setLoginBanner(data.loginBanner);
      setSignUpBanner(data.signUpBanner);
    };
    fetchSiteData();
  }, []);

  // Image upload function
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/file/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();
    return data.filePath;
  };

  // Update functions for each field with toast notifications
  const updateLogo = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/siteData/updateLogo`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logo }),
      }
    );
    if (response.ok) toast.success("Logo updated successfully!");
  };

  const updateHomeBanner = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/siteData/updateHomeBanner`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeBanner }),
      }
    );
    if (response.ok) toast.success("Home banner updated successfully!");
  };

  const updateHomeSlogan = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/siteData/updateHomeSlogan`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeSlogan }),
      }
    );
    if (response.ok) toast.success("Home slogan updated successfully!");
  };

  const updateHomeSmallText = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/siteData/updateHomeSmallText`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeSmallText }),
      }
    );
    if (response.ok) toast.success("Home small text updated successfully!");
  };

  const updateLoginBanner = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/siteData/updateLoginBanner`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginBanner }),
      }
    );
    if (response.ok) toast.success("Login Banner updated successfully!");
  };

  const updateSignUpBanner = async () => {
    console.log("AAAAAA", signUpBanner)
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/siteData/updateSignUpBanner`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signUpBanner }),
      }
    );
    if (response.ok) toast.success("SignUp Banner updated successfully!");
  };

  // Image upload handlers
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    const filePath = await uploadFile(file);
    setLogo(filePath);
  };

  const handleHomeBannerUpload = async (e) => {
    const file = e.target.files[0];
    const filePath = await uploadFile(file);
    setHomeBanner(filePath);
  };

  const handleSignUpUpload = async (e) => {
    const file = e.target.files[0];
    const filePath = await uploadFile(file);
    setSignUpBanner(filePath);
  };

  const handleLoginUpload = async (e) => {
    const file = e.target.files[0];
    const filePath = await uploadFile(file);
    setLoginBanner(filePath);
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
    <div className="p-6">
      <ToastContainer />
      <h3 className="text-4xl font-semibold mb-8">Welcome, Admin</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {/* Logo Update */}
        <div className="bg-gray-100 rounded-lg shadow-lg p-6">
          <h4 className="text-2xl font-semibold mb-4">Update Logo</h4>
          <img
            src={logo}
            alt="Logo Preview"
            className="w-24 h-24 object-cover mb-4"
          />
          <input
            type="file"
            onChange={handleLogoUpload}
            className="mb-4 block w-full text-gray-700"
          />
          <button
            onClick={updateLogo}
            className="bg-slate-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-slate-700"
          >
            Save Logo
          </button>
        </div>

        {/* Home Banner Update */}
        <div className="bg-gray-100 rounded-lg shadow-lg p-6">
          <h4 className="text-2xl font-semibold mb-4">Update Home Banner</h4>
          <img
            src={homeBanner}
            alt="Home Banner Preview"
            className="w-full h-32 object-cover mb-4 rounded"
          />
          <input
            type="file"
            onChange={handleHomeBannerUpload}
            className="mb-4 block w-full text-gray-700"
          />
          <button
            onClick={updateHomeBanner}
            className="bg-slate-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-slate-700"
          >
            Save Banner
          </button>
        </div>

        <div className="bg-gray-100 rounded-lg shadow-lg p-6">
          <h4 className="text-2xl font-semibold mb-4">Update Login Banner</h4>
          <img
            src={loginBanner}
            alt="Login Banner Preview"
            className="w-full h-32 object-cover mb-4 rounded"
          />
          <input
            type="file"
            onChange={handleLoginUpload}
            className="mb-4 block w-full text-gray-700"
          />
          <button
            onClick={updateLoginBanner}
            className="bg-slate-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-slate-700"
          >
            Save Banner
          </button>
        </div>


        <div className="bg-gray-100 rounded-lg shadow-lg p-6">
          <h4 className="text-2xl font-semibold mb-4">Update SignUp Banner</h4>
          <img
            src={signUpBanner}
            alt="Login Banner Preview"
            className="w-full h-32 object-cover mb-4 rounded"
          />
          <input
            type="file"
            onChange={handleSignUpUpload}
            className="mb-4 block w-full text-gray-700"
          />
          <button
            onClick={updateSignUpBanner}
            className="bg-slate-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-slate-700"
          >
            Save Banner
          </button>
        </div>

        {/* Home Slogan Update */}
        <div className="bg-gray-100 rounded-lg shadow-lg p-6">
          <h4 className="text-2xl font-semibold mb-4">Update Home Slogan</h4>
          <textarea
            value={homeSlogan}
            onChange={(e) => setHomeSlogan(e.target.value)}
            className="w-full p-2 border rounded mb-4 text-gray-700"
            placeholder="Enter home slogan"
          />
          <button
            onClick={updateHomeSlogan}
            className="bg-slate-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-slate-700"
          >
            Save Slogan
          </button>
        </div>

        {/* Home Small Text Update */}
        <div className="bg-gray-100 rounded-lg shadow-lg p-6">
          <h4 className="text-2xl font-semibold mb-4">
            Update Home Small Text
          </h4>
          <textarea
            value={homeSmallText}
            onChange={(e) => setHomeSmallText(e.target.value)}
            className="w-full p-2 border rounded mb-4 text-gray-700"
            placeholder="Enter home small text"
          />
          <button
            onClick={updateHomeSmallText}
            className="bg-slate-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-slate-700"
          >
            Save Text
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
