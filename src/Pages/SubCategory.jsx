import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../hooks/useAuthContext";
import offerImg from "../../public/offer-removebg-preview.png";
import outOfStockImg from "../../public/out of stock.png";

const SubCategory = () => {
  const { user } = useAuthContext();
  const { id } = useParams();
  const [subCategory, setSubCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [selectedSubSubCategories, setSelectedSubSubCategories] = useState([]);

  const fetchSubCategory = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/subCategory/` + id
      );
      if (!response.ok) throw new Error("Failed to fetch SubCategory");
      const data = await response.json();
      setSubCategory(data);
    } catch (error) {
      console.error("Error fetching subcategory:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/product/getProductsBySubCategoryId/` + id
      );
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchSubSubCategories = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/subsubCategory/subSubCategoryBySubCategoryID/` + id
      );
      if (!response.ok) throw new Error("Failed to fetch subSubCategories");
      const data = await response.json();
      setSubSubCategories(data);
    } catch (error) {
      console.error("Error fetching subSubCategories:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSubCategory();
      fetchSubSubCategories();
    }
  }, [id]);

  useEffect(() => {
    if (subCategory) {
      fetchProducts();
    }
  }, [subCategory]);

  // Sorting states - Default sorting: Least Selling, High Price, All, Sort by Names
  const [sortBySales, setSortBySales] = useState("least"); // "most" or "least"
  const [sortByPrice, setSortByPrice] = useState("high"); // "high" or "low"
  const [sortByOffer, setSortByOffer] = useState("all"); // "all" or "offer"
  const [sortByType, setSortByType] = useState("name"); // "name" or "date"
  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearchTerm = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubSubCategory =
        selectedSubSubCategories.length === 0 ||
        selectedSubSubCategories.includes(product.subSubCategory);
      return matchesSearchTerm && matchesSubSubCategory;
    })
    .filter((product) => {
      if (sortByOffer === "offer") {
        return product.hasOffer === true;
      }
      return true; // "all" - show all products
    })
    .sort((a, b) => {
      // First priority: Put out-of-stock products (stock: 0) at the end
      const aIsOutOfStock = !a.stock || a.stock === 0;
      const bIsOutOfStock = !b.stock || b.stock === 0;
      
      if (aIsOutOfStock && !bIsOutOfStock) {
        return 1; // a goes after b
      }
      if (!aIsOutOfStock && bIsOutOfStock) {
        return -1; // a goes before b
      }
      if (aIsOutOfStock && bIsOutOfStock) {
        // Both are out of stock, sort them normally among themselves
      }

      // Sort by sales (orderCount) - Default: Least Selling
      if (sortBySales === "most") {
        if (b.orderCount !== a.orderCount) {
          return b.orderCount - a.orderCount; // Most selling: higher orderCount first
        }
      } else if (sortBySales === "least") {
        if (a.orderCount !== b.orderCount) {
          return a.orderCount - b.orderCount; // Least selling: lower orderCount first
        }
      }

      // Sort by price - Default: High Price
      const getPrice = (product) => {
        if (user?.user?.userView === "BC") return product.priceBC;
        if (user?.user?.userView === "MC") return product.priceMC;
        if (user?.user?.userView === "SC") return product.priceSC;
        return product.priceFC; // Default to FC
      };

      const priceA = getPrice(a);
      const priceB = getPrice(b);

      if (sortByPrice === "high") {
        if (priceB !== priceA) {
          return priceB - priceA; // High price: higher prices first
        }
      } else if (sortByPrice === "low") {
        if (priceA !== priceB) {
          return priceA - priceB; // Low price: lower prices first
        }
      }

      // Sort by name or date - Default: Sort by Names
      if (sortByType === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortByType === "date") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }

      return 0;
    });

  const handleCheckboxChange = (subSubCategoryId) => {
    setSelectedSubSubCategories((prevSelected) =>
      prevSelected.includes(subSubCategoryId)
        ? prevSelected.filter((id) => id !== subSubCategoryId)
        : [...prevSelected, subSubCategoryId]
    );
  };



  return (
    <div>
      <ToastContainer />
      {/* Banner Section */}
      <div
        className="bg-fixed bg-cover bg-center w-full relative mb-10"
        style={{
          backgroundImage: `url(${subCategory?.bannerImage || ""})`,
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 py-[200px] text-center">
          <h1 className="md:text-8xl text-6xl text-white pb-5">{subCategory?.name}</h1>
          <h3 className="text-3xl text-slate-300">
            {subCategory?.slogan || ""}
          </h3>
        </div>
      </div>

      {/* Search and Sidebar Section */}
      <div className="md:w-3/4 w-full mx-auto md:flex pt-8 px-2 md:px-0">
        {/* Sidebar */}
        <div className="md:w-1/4 w-full p-4 border-r">
          <h2 className="text-base mb-4">Filter by Sub-Sub-Category</h2>
          {subSubCategories.map((subSubCategory) => (
            <div key={subSubCategory._id} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={subSubCategory._id}
                checked={selectedSubSubCategories.includes(subSubCategory._id)}
                onChange={() => handleCheckboxChange(subSubCategory._id)}
                className="mr-2"
              />
              <label htmlFor={subSubCategory._id}>{subSubCategory.name}</label>
            </div>
          ))}
        </div>

        {/* Main Product Display */}
        <div className="md:w-3/4 w-full ">
          {/* Desktop Layout */}
          <div className="mb-20 hidden md:flex justify-between items-center gap-4">
            {/* Search bar on the left */}
            <label className="input input-bordered flex items-center gap-2 w-1/3">
              <input
                type="text"
                className="grow"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70"
              >
                <path
                  fillRule="evenodd"
                  d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </label>

            {/* Sorting buttons on the right */}
            <div className="flex gap-2">
              {/* Sales Sort */}
              <button
                onClick={() => setSortBySales(sortBySales === "most" ? "least" : "most")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBySales === "least" 
                    ? "bg-[#212121] text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {sortBySales === "least" ? "Most Orders" : "Least Orders"}
              </button>

              {/* Price Sort */}
              <button
                onClick={() => setSortByPrice(sortByPrice === "high" ? "low" : "high")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortByPrice === "high" 
                    ? "bg-[#212121] text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {sortByPrice === "high" ? "Low Price" : "High Price"}
              </button>

              {/* Offer Filter */}
              <button
                onClick={() => setSortByOffer(sortByOffer === "all" ? "offer" : "all")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortByOffer === "all" 
                    ? "bg-[#212121] text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {sortByOffer === "all" ? "Offers only" : "All"}
              </button>

              {/* Name/Date Sort */}
              <button
                onClick={() => setSortByType(sortByType === "name" ? "date" : "name")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortByType === "name" 
                    ? "bg-[#212121] text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {sortByType === "name" ? "Sort by Dates" : "Sort By Names"}
              </button>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="mb-20 md:hidden space-y-4">
            {/* Search bar */}
            <label className="input input-bordered flex items-center gap-2 w-full">
              <input
                type="text"
                className="grow"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70"
              >
                <path
                  fillRule="evenodd"
                  d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </label>

            {/* Sorting buttons in 2x2 grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSortBySales(sortBySales === "most" ? "least" : "most")}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                  sortBySales === "least" 
                    ? "bg-[#212121] text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {sortBySales === "least" ? "Most Orders" : "Least Orders"}
              </button>

              <button
                onClick={() => setSortByPrice(sortByPrice === "high" ? "low" : "high")}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                  sortByPrice === "high" 
                    ? "bg-[#212121] text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {sortByPrice === "high" ? "Low Price" : "High Price"}
              </button>

              <button
                onClick={() => setSortByOffer(sortByOffer === "all" ? "offer" : "all")}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                  sortByOffer === "all" 
                    ? "bg-[#212121] text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {sortByOffer === "all" ? "Offers only" : "All"}
              </button>

              <button
                onClick={() => setSortByType(sortByType === "name" ? "date" : "name")}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                  sortByType === "name" 
                    ? "bg-[#212121] text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {sortByType === "name" ? "Sort by Dates" : "Sort By Names"}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} userId={user?.user?._id} user={user} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, userId, user }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [qty, setQty] = useState(1);
  const [qtyError, setQtyError] = useState("");

  const handleAddToCartClick = (e) => {
    e.preventDefault();
    setQty(1);
    setQtyError("");
    setShowQtyModal(true);
  };

  const handleQtyChange = (e) => {
    const value = Number(e.target.value);
    if (value > product.stock) {
      setQty(product.stock);
      setQtyError("");
      toast.error(`Cannot exceed available stock (${product.stock})`);
    } else if (value < 1) {
      setQty(1);
      setQtyError("");
    } else {
      setQty(value);
      setQtyError("");
    }
  };

  const handleDecrement = () => {
    setQty((prev) => {
      const newQty = prev - 1;
      if (newQty < 1) return 1;
      return newQty;
    });
    setQtyError("");
  };

  const handleIncrement = () => {
    setQty((prev) => {
      const newQty = prev + 1;
      if (newQty > product.stock) {
        toast.error(`Cannot exceed available stock (${product.stock})`);
        return product.stock;
      }
      return newQty;
    });
    setQtyError("");
  };

  const handleConfirmAddToCart = async () => {
    if (qty < 1 || qty > product.stock) {
      setQtyError(`Please enter a quantity between 1 and ${product.stock}`);
      return;
    }
    const data = { userId: userId, productId: product._id, qty };
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart/addToCart/` + userId,
        data
      );
      if (response.status === 200) {
        toast.success("Product Successfully Added to Your Cart!");
        setShowQtyModal(false);
      } else {
        toast.error("Failed to add product to cart.");
      }
    } catch (error) {
      toast.error("Error Adding to Cart: " + error.message);
    }
  };


  const [daysLeft, setDaysLeft] = useState(null);

  // Function to calculate the days left until offerTill
  const calculateDaysLeft = () => {
    if (product?.offerPanicStarts) {
      const today = new Date();
      const offerTill = new Date(product?.offerTill);
      const offerPanicStarts = new Date(product?.offerPanicStarts);

      // Check if today's date is greater than or equal to offerPanicStarts
      if (today >= offerPanicStarts) {
        const timeDiff = offerTill - today;
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
        setDaysLeft(daysRemaining);
      } else {
        setDaysLeft(null); // No days left if the panic period hasn't started yet
      }
    }
  };

  useEffect(() => {
    calculateDaysLeft();
  }, [product]);

  return (
    <div
      className="border rounded-lg mx-1 md:mx-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/productDetails/${product?._id}`}>
        <div className="relative min-w-full h-[140px] md:h-[200px]">
          <img
            className="w-full rounded-t-lg h-[140px] md:h-[200px] object-cover"
            src={product?.productThumbnail}
            alt=""
          />
          <div className="overlay h-full hover-effect z-40 absolute inset-0 flex items-center justify-center">
            <div className=" absolute top-0 left-0">
              {product?.hasOffer && daysLeft !== null && daysLeft >= 0 && (
                <div className="bg-slate-900 text-white px-1 py-0.5 md:px-2 md:py-1 rounded-r-box text-xs md:text-sm font-medium">
                  Offer Available - {daysLeft} day{daysLeft > 1 ? "s" : ""} left
                </div>
              )}
              {product?.hasOffer && daysLeft === null && (
                <div className="bg-slate-900 text-white px-1 py-0.5 md:px-2 md:py-1 rounded-r-box text-xs md:text-sm font-medium">
                  Offer Available
                </div>
              )}
            </div>
            <div className=" absolute bottom-0 right-0">
              <div className="gap-2">
                {(!product?.stock || product?.stock < 1) && (
                  <div className="bg-slate-900 text-white px-1 py-0.5 md:px-2 md:py-1 rounded-l-box text-xs md:text-sm font-medium">
                    Out of Stock
                  </div>
                )}
                {product?.stock >= 1 && product?.stock <= product?.panicStock && (
                  <div className="bg-slate-900 text-white px-1 py-0.5 md:px-2 md:py-1 rounded-l-box text-xs md:text-sm font-medium">
                    Only {product?.stock} available
                  </div>
                )}
              </div>
            </div>
            <div
              className={`text-white z-50 text-sm md:text-lg transition-opacity ${isHovered ? "opacity-100" : "opacity-0"
                }`}
            >
              {product?.specialLines.map((sl) => (
                <p key={sl} className="py-0.5 md:py-1 text-center">
                  {sl}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="p-1 md:p-2 h-[100px] md:h-[150px] flex flex-col justify-between">
          <h3 className="text-sm md:text-2xl text-center">{product?.name}</h3>
          {user?.user?.userView === "BC" && <h4 className="text-xs md:text-xl text-center">Price: {product?.priceBC}/-</h4>}
          {user?.user?.userView === "MC" && <h4 className="text-xs md:text-xl text-center">Price: {product?.priceMC}/-</h4>}
          {(!user || user?.user?.userView === "FC") && <h4 className="text-xs md:text-xl text-center">Price: {product?.priceFC}/-</h4>}
          {user?.user?.userView === "SC" && <h4 className="text-xs md:text-xl text-center">Price: {product?.priceSC}/-</h4>}
        </div>
      </Link>
      {user?.user?._id && (
        <>
          <button
            onClick={handleAddToCartClick}
            className="bg-[#212121] rounded-b-lg p-1 md:p-2 text-white mt-2 md:mt-4 text-sm md:text-xl w-full"
          >
            Add to Cart
          </button>
          {showQtyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowQtyModal(false)}
                >
                  &times;
                </button>
                <h2 className="text-xl font-semibold mb-4 text-center">Select Quantity</h2>
                <div className="mb-4 flex flex-col items-center">
                  <div className="flex items-center">
                    <button
                      className="px-2 py-1 bg-gray-200 rounded-l text-xl"
                      onClick={handleDecrement}
                      disabled={qty <= 1}
                      type="button"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={product.stock}
                      value={qty}
                      onChange={handleQtyChange}
                      className="border-t border-b border-gray-300 px-3 py-2 w-16 text-center focus:outline-none"
                      style={{ borderLeft: 'none', borderRight: 'none' }}
                    />
                    <button
                      className="px-2 py-1 bg-gray-200 rounded-r text-xl"
                      onClick={handleIncrement}
                      disabled={qty >= product.stock}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500 mt-1">Available: {product.stock}</span>
                  {qtyError && <span className="text-red-500 text-xs mt-1">{qtyError}</span>}
                </div>
                <button
                  className="bg-[#212121] text-white px-4 py-2 rounded w-full disabled:opacity-50"
                  onClick={handleConfirmAddToCart}
                  disabled={qty < 1 || qty > product.stock}
                >
                  Confirm
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SubCategory;
