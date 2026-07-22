import { useEffect, useState, useRef } from "react";
import { CgProfile } from "react-icons/cg";
import { FaCartArrowDown } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";

const Navbar = () => {
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const [mainUser, setMainUser] = useState(null);
  const [logo, setLogo] = useState("");
  const [categories, setCategories] = useState([]);
  const [subCategoriesMap, setSubCategoriesMap] = useState({});
  const [showCategories, setShowCategories] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const categoryMenuRef = useRef(null);
  const categoryButtonRef = useRef(null);


  // Fetch current site data
  const fetchSiteData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/siteData/getSiteData`
      );
      const data = await response.json();
      setLogo(data.logo);
    } catch (error) {
      console.error("Error fetching site data:", error);
    }
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/getSingleUser/${user?.user?._id}`
      );
      const data = await response.json();
      setMainUser(data?.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Fetch categories and subcategories data
  const fetchCategoriesAndSubCategories = async () => {
    try {
      const categoryResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/category/`
      );
      const categoriesData = await categoryResponse.json();
      setCategories(categoriesData);

      const subCategoryResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/subCategory/`
      );
      const subCategoriesData = await subCategoryResponse.json();
      const subCategoryMap = {};
      subCategoriesData.forEach((subCategory) => {
        subCategoryMap[subCategory._id] = subCategory.name;
      });
      setSubCategoriesMap(subCategoryMap);
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };

  // UseEffect to fetch data on mount
  useEffect(() => {
    if (user?.user?._id) {
      fetchUserData();
    }
  }, [user?.user?._id]);

  useEffect(() => {
    fetchSiteData();
    fetchCategoriesAndSubCategories();
  }, [])
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location]);

  // Handle clicks outside to close the menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target) &&
        categoryButtonRef.current &&
        !categoryButtonRef.current.contains(event.target)
      ) {
        setShowCategories(false);
        setActiveCategory(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleCategories = () => {
    setShowCategories((prev) => !prev);
  };

  console.log(showCategories);
  console.log(activeCategory);


  const toggleSubCategories = (categoryId) => {
    setActiveCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  const menu = (
    <ul className="md:flex text-black md:gap-8 justify-center items-center md:text-lg md:text-white">
      <Link to={"/"}>
        <li className="ml-3 md:ml-0">Home</li>
      </Link>
      {user?.user?.role === "admin" && (
        <Link to={"/dashboard/admin/adminHome"}>
          <li>Dashboard</li>
        </Link>
      )}
      {user?.user?.role === "user" && (
        <Link to={"/dashboard/user/orderHistory"}>
          <li className="ml-3 md:ml-0">Dashboard</li>
        </Link>
      )}
      <li className="">
        <Link to={'/allProducts'}>
          <li className="md:text-white"> All Products</li>
        </Link>
      </li>


      <li className="relative" ref={categoryMenuRef}>
        <button ref={categoryButtonRef} onClick={toggleCategories}>
          Products by Category
        </button>
        {showCategories && (
          <ul
            className={`absolute left-0 mt-2 bg-white text-black rounded-md shadow-lg p-4 md:w-64 h-[600px] ${(activeCategory !== null) ? "overflow-y-clip" : "overflow-y-auto"}  z-50`}
            style={{ scrollbarWidth: "thin", scrollbarColor: "#888 transparent" }}
          >
            {categories.map((category) => (
              <li
                key={category._id}
                className="relative py-2 px-4 hover:bg-gray-100"
              >
                <button onClick={() => toggleSubCategories(category._id)}>
                  {category.name}
                </button>
                {activeCategory === category._id && category.subCategories.length > 0 && (
                  <ul
                    className="absolute left-full top-0 bg-white text-black rounded-md shadow-lg p-4 md:w-48 max-h-96 overflow-y-auto z-50"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "#888 transparent" }}
                  >
                    {category.subCategories.map((subCategoryId) => (
                      <li key={subCategoryId} className="py-1 px-2 hover:bg-gray-200">
                        <Link
                          to={`/subCategory/${subCategoryId}`}
                          onClick={() => {
                            setShowCategories(false);
                            setActiveCategory(null);
                          }}
                        >
                          {subCategoriesMap[subCategoryId]}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </li>
    </ul>
  );

  return (
    <div
      className={`fixed w-full md: py-5 z-50 transition-all duration-300 ${isScrolled || location.pathname.startsWith("/productDetails") ? "bg-[#212121]" : "bg-transparent"
        }`}
    >

      <div className="navbar flex justify-around md:w-3/4  mx-auto ">
        <div className="navbar-start   w-[35%] md:w-[35%]">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] w-52 mt-3 p-2 shadow">
              {menu}
            </ul>
          </div>
          <div className=" md:block">
            <Link to={"/"}>
              <img src={logo} className=" w-[110px]" alt="Logo" />
            </Link>
          </div>
        </div>
        <div className=" navbar-center  hidden md:flex ">
          <ul className="menu justify-center items-center menu-horizontal px-1">
            {menu}
          </ul>
        </div>
        <div className="navbar-end">
          {/* <a className="btn">Button</a> */}
          <div className="flex  items-center gap-3">
            {user ? (
              <div className={`text-white flex items-center gap-5 rounded-full`}>
                <Link to={"/dashboard/user/cart"}>
                  <FaCartArrowDown className="text-white text-4xl p-2 rounded-full cursor-pointer" />
                </Link>
                <p className="pl-4 hidden md:block text-xs md:text-[16px] ">
                  {mainUser?.firstName} {mainUser?.lastName}
                </p>
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                    <div className="w-9 rounded-full border-2 border-white">
                      <img
                        className="w-9 h-9 object-top rounded-full object-cover"
                        alt="Profile"
                        src={mainUser?.image}
                      />
                    </div>
                  </div>
                  <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content bg-base-100 rounded-md z-[1] mt-3 w-52 p-2 shadow text-black"
                  >
                    <li>
                      <Link to={"/dashboard/user/profile"}>
                        <CgProfile /> Profile
                      </Link>
                    </li>
                    <li>
                      <Link onClick={logout}>
                        <MdLogout /> Logout
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex gap-10 items-center font-semibold">
                <Link to={"/login"}>Login</Link>
                <Link to={"/signup"} className="bg-[#222d37] text-white px-3 pt-1 pb-[0.4rem] rounded-md">
                  Signup
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
