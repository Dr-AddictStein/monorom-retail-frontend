import { useEffect, useState } from "react";
import { FaHome, FaShoppingCart, FaUser } from "react-icons/fa";
import { ImProfile } from "react-icons/im";
import { IoCheckmarkDoneCircleOutline, IoChevronDown, IoHome } from "react-icons/io5";
import {
import { BACKEND_URL } from "@/config";
  MdAdd,
  MdArticle,
  MdCallReceived,
  MdCategory,
  MdCookie,
  MdGavel,
  MdHistoryEdu,
  MdInfoOutline,
  MdOutlineLogout,
  MdOutlineNotifications,
  MdOutlineProductionQuantityLimits,
  MdPrivacyTip,
  MdTrendingDown,
} from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";
import { CgDanger } from "react-icons/cg";

const Sidebar = ({ onClose }) => {
  const [role, setRole] = useState("");
  const [userView, setUserView] = useState("");
  const { logout } = useLogout();
  const location = useLocation();
  const [logo, setLogo] = useState("");
  const [homeBanner, setHomeBanner] = useState("");
  const [homeSlogan, setHomeSlogan] = useState("");
  const [homeSmallText, setHomeSmallText] = useState("");
  const [siteCustomOpen, setSiteCustomOpen] = useState(false);

  const { user } = useAuthContext();

  // Handle link clicks on mobile
  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    if (user?.user?.role && user?.user?.userView) {
      setRole(user?.user?.role);
      setUserView(user?.user?.userView);
    }
  }, [user?.user?.role, user?.user?.userView]);

  const siteCustomPaths = [
    "/dashboard/admin/adminHome",
    "/dashboard/admin/aboutUs",
    "/dashboard/admin/termsOfUse",
    "/dashboard/admin/privacyPolicy",
    "/dashboard/admin/cookiePolicy",
  ];
  const isSiteCustomActive =
    siteCustomPaths.includes(location.pathname) ||
    location.pathname.startsWith("/dashboard/admin/blogs");

  useEffect(() => {
    if (isSiteCustomActive) {
      setSiteCustomOpen(true);
    }
  }, [isSiteCustomActive]);

  const subLinkClass = (active) =>
    `rounded-lg px-2 py-1 flex gap-2 items-center dashboard-link text-base ${
      active ? "bg-white text-black" : "text-gray-200"
    }`;

  // Fetch current site data on component mount
  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/siteData/getSiteData`
        );
        const data = await response.json();
        console.log('Site data fetched:', data);
        setLogo(data.logo);
        setHomeBanner(data.homeBanner);
        setHomeSlogan(data.homeSlogan);
        setHomeSmallText(data.homeSmallText);
      } catch (error) {
        console.error('Error fetching site data:', error);
      }
    };
    fetchSiteData();
  }, []);

  return (
    <div className="bg-[#212121] text-white p-1 h-full w-full text-lg flex flex-col overflow-y-auto pt-4 sidebar-scrollbar shadow-lg">
      <div className="pt-0 pb-5 px-4">
        <div className="flex flex-col items-center">
          {logo ? (
            <img 
              src={logo} 
              alt="Monorom Logo" 
              className="w-[110px] h-auto mb-3 object-contain" 
              onLoad={() => console.log('Logo loaded successfully:', logo)}
              onError={(e) => {
                console.error('Logo failed to load:', logo);
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-[110px] h-[60px] mb-3 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#212121] font-bold text-2xl">M</span>
            </div>
          )}
          <p className="text-center font-sans text-2xl font-bold text-white">Monorom</p>
        </div>
      </div>
      {role === "admin" && (
        <div className="flex flex-col gap-2 pl-2">
          <div>
            <button
              type="button"
              onClick={() => setSiteCustomOpen((open) => !open)}
              className={`w-full rounded-lg px-1 py-1 flex gap-2 items-center dashboard-link ${
                isSiteCustomActive ? "bg-white/10" : ""
              }`}
            >
              <IoHome />
              <span className="flex-1 text-left">Site Customization</span>
              <IoChevronDown
                className={`transition-transform ${siteCustomOpen ? "rotate-180" : ""}`}
              />
            </button>
            {siteCustomOpen && (
              <div className="mt-1 ml-3 pl-3 border-l border-white/20 flex flex-col gap-1">
                <Link
                  to="/dashboard/admin/adminHome"
                  onClick={handleLinkClick}
                  className={subLinkClass(location.pathname === "/dashboard/admin/adminHome")}
                >
                  <IoHome /> Homepage
                </Link>
                <Link
                  to="/dashboard/admin/aboutUs"
                  onClick={handleLinkClick}
                  className={subLinkClass(location.pathname === "/dashboard/admin/aboutUs")}
                >
                  <MdInfoOutline /> About us
                </Link>
                <Link
                  to="/dashboard/admin/termsOfUse"
                  onClick={handleLinkClick}
                  className={subLinkClass(location.pathname === "/dashboard/admin/termsOfUse")}
                >
                  <MdGavel /> Terms of use
                </Link>
                <Link
                  to="/dashboard/admin/privacyPolicy"
                  onClick={handleLinkClick}
                  className={subLinkClass(location.pathname === "/dashboard/admin/privacyPolicy")}
                >
                  <MdPrivacyTip /> Privacy policy
                </Link>
                <Link
                  to="/dashboard/admin/cookiePolicy"
                  onClick={handleLinkClick}
                  className={subLinkClass(location.pathname === "/dashboard/admin/cookiePolicy")}
                >
                  <MdCookie /> Cookie policy
                </Link>
                <Link
                  to="/dashboard/admin/blogs"
                  onClick={handleLinkClick}
                  className={subLinkClass(location.pathname.startsWith("/dashboard/admin/blogs"))}
                >
                  <MdArticle /> Blogs
                </Link>
              </div>
            )}
          </div>
          <Link
            to="/dashboard/admin/category"
            onClick={handleLinkClick}
            className={`rounded-lg px-1 py-1 flex gap-2 items-center dashboard-link ${location.pathname === "/dashboard/admin/category"
                ? "bg-white text-black"
                : ""
              }`}
          >
            <MdCategory /> Categories
          </Link>
          <Link
            to="/dashboard/admin/product"
            onClick={handleLinkClick}
            className={`rounded-lg px-1 py-1 flex gap-2 items-center dashboard-link ${location.pathname === "/dashboard/admin/product"
                ? "bg-white text-black"
                : ""
              }`}
          >
            <MdOutlineProductionQuantityLimits /> Products
          </Link>
          <Link
            to="/dashboard/admin/lowestOrderProducts"
            onClick={handleLinkClick}
            className={`rounded-lg px-1 py-1 flex gap-2 items-center dashboard-link ${location.pathname === "/dashboard/admin/lowestOrderProducts"
                ? "bg-white text-black"
                : ""
              }`}
          >
            <MdTrendingDown /> Lowest Order Products
          </Link>
          <Link
            to="/dashboard/admin/restockproduct"
            onClick={handleLinkClick}
            className={`rounded-lg px-1 py-1 flex gap-2 items-center dashboard-link ${location.pathname === "/dashboard/admin/restockproduct"
                ? "bg-white text-black"
                : ""
              }`}
          >
            <CgDanger /> Restock Products
          </Link>
          <Link
            to="/dashboard/admin/addProduct"
            onClick={handleLinkClick}
            className={`rounded-lg px-1 py-1 flex gap-2 items-center dashboard-link ${location.pathname === "/dashboard/admin/addProduct"
                ? "bg-white text-black"
                : ""
              }`}
          >
            <MdAdd /> Add Product
          </Link>
          <Link
            to="/dashboard/admin/receivedOrders"
            onClick={handleLinkClick}
            className={`rounded-lg px-1 py-1 flex gap-2 items-center dashboard-link ${location.pathname === "/dashboard/admin/receivedOrders"
                ? "bg-white text-black"
                : ""
              }`}
          >
            <MdCallReceived /> Received Orders
          </Link>
          <Link
            to="/dashboard/admin/completedOrders"
            onClick={handleLinkClick}
            className={`rounded-lg px-1 py-1 flex gap-2 items-center dashboard-link ${location.pathname === "/dashboard/admin/completedOrders"
                ? "bg-white text-black"
                : ""
              }`}
          >
            <IoCheckmarkDoneCircleOutline /> Completed Orders
          </Link>
          <Link
            to="/user/orderHistory"
            onClick={handleLinkClick}
            className={`rounded-lg px-1 py-1 flex gap-2 items-center dashboard-link ${location.pathname === "/user/orderHistory"
                ? "bg-white text-black"
                : ""
              }`}
          >
            <MdHistoryEdu /> My Order History
          </Link>
          <Link
            to="/dashboard/admin/users"
            onClick={handleLinkClick}
            className={`rounded-lg px-1 py-1 flex gap-2 items-center dashboard-link ${location.pathname === "/dashboard/admin/users"
                ? "bg-white text-black"
                : ""
              }`}
          >
            <FaUser /> Users
          </Link>
          <Link
            to="/dashboard/admin/notificationSender"
            onClick={handleLinkClick}
            className={`rounded-lg px-1 py-1 flex gap-2 items-center dashboard-link ${location.pathname === "/dashboard/admin/notificationSender"
                ? "bg-white text-black"
                : ""
              }`}
          >
            <MdOutlineNotifications /> Notification Sender
          </Link>
        </div>
      )}
      {role === "user" && (
        <div className="flex flex-col gap-2 pl-2">
          <Link
            to="/user/orderHistory"
            onClick={handleLinkClick}
            className={`rounded-lg px-1 py-1 flex gap-2 items-center dashboard-link ${location.pathname === "/user/orderHistory"
                ? "bg-white text-black"
                : ""
              }`}
          >
            <MdHistoryEdu /> My Order History
          </Link>
          {userView === "SC" && (
            <Link
              to="/dashboard/admin/lowestOrderProducts"
              onClick={handleLinkClick}
              className={`rounded-lg px-1 py-1 flex gap-2 items-center dashboard-link ${location.pathname === "/dashboard/admin/lowestOrderProducts"
                  ? "bg-white text-black"
                  : ""
                }`}
            >
              <MdTrendingDown /> Lowest Order Products
            </Link>
          )}
        </div>
      )}
      <div className="divider bg-white h-0.5 mx-3 mt-8"></div>
      <div className="flex flex-col gap-2 p-3">
        <Link
          to="/"
          onClick={handleLinkClick}
          className={`flex gap-2 items-center dashboard-link ${location.pathname === "/" ? "bg-white text-black" : ""
            }`}
        >
          <FaHome /> Home
        </Link>
        <Link
          to="/dashboard/user/profile"
          onClick={handleLinkClick}
          className={`rounded-lg px-1 py-1 flex gap-2 items-center dashboard-link ${location.pathname === "/dashboard/user/profile"
              ? "bg-white text-black"
              : ""
            }`}
        >
          <ImProfile /> My Profile
        </Link>
        <Link
          to="/user/cart"
          onClick={handleLinkClick}
          className={`rounded-lg px-1 py-1 flex gap-2 items-center dashboard-link ${location.pathname === "/user/cart"
              ? "bg-white text-black"
              : ""
            }`}
        >
          <FaShoppingCart /> My Cart
        </Link>
        <Link
          onClick={() => {
            handleLinkClick();
            logout();
          }}
          className="rounded-lg px-1 py-1 flex gap-2 items-center dashboard-link"
        >
          <MdOutlineLogout /> Logout
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
