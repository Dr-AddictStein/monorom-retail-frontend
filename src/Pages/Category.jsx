import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigationType, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../hooks/useAuthContext";
import { useCart } from "../context/CartContext";
import { getProductPrice } from "../utils/productPrice";
import { BACKEND_URL } from "@/config";

const Category = () => {
  const { user } = useAuthContext();
  const { slug } = useParams();
  const navigationType = useNavigationType();
  const productsSectionRef = useRef(null);
  const hasHandledScroll = useRef(false);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const scrollKey = `category-scroll-${slug}`;

  const fetchCategory = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/category/${slug}`
      );
      if (!response.ok) throw new Error("Failed to fetch Category");
      const data = await response.json();
      setCategory(data);
      return data;
    } catch (error) {
      console.error("Error fetching category:", error);
      return null;
    }
  };

  const fetchProducts = async (categoryId) => {
    if (!categoryId) {
      setProducts([]);
      setProductsLoaded(true);
      return;
    }
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/product/getProductsByCategoryId/${categoryId}`
      );
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductsLoaded(true);
    }
  };

  useEffect(() => {
    if (slug) {
      hasHandledScroll.current = false;
      setProducts([]);
      setProductsLoaded(false);
      setCategory(null);
      (async () => {
        const data = await fetchCategory();
        await fetchProducts(data?._id);
      })();
    }
  }, [slug]);

  // Remember scroll while browsing; save on leave
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const saveScroll = () => {
      sessionStorage.setItem(scrollKey, String(window.scrollY));
    };

    window.addEventListener("scroll", saveScroll, { passive: true });
    return () => {
      saveScroll();
      window.removeEventListener("scroll", saveScroll);
    };
  }, [scrollKey]);

  // Fresh visit → first product; back navigation → restore last position
  useEffect(() => {
    if (hasHandledScroll.current) return;
    if (!productsLoaded) return;

    const applyScroll = () => {
      if (hasHandledScroll.current) return;
      hasHandledScroll.current = true;

      if (navigationType === "POP") {
        const saved = sessionStorage.getItem(scrollKey);
        if (saved !== null) {
          window.scrollTo({ top: Number(saved), behavior: "auto" });
          return;
        }
      }
      productsSectionRef.current?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    };

    const t = window.setTimeout(applyScroll, 50);
    return () => window.clearTimeout(t);
  }, [productsLoaded, navigationType, scrollKey]);

  const [sortBySales, setSortBySales] = useState("least");
  const [sortByPrice, setSortByPrice] = useState("high");
  const [sortByOffer, setSortByOffer] = useState("all");
  const [sortByType, setSortByType] = useState("name");

  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((product) => {
      if (sortByOffer === "offer") {
        return product.hasOffer === true;
      }
      return true;
    })
    .sort((a, b) => {
      const aIsOutOfStock = !a.stock || a.stock === 0;
      const bIsOutOfStock = !b.stock || b.stock === 0;

      if (aIsOutOfStock && !bIsOutOfStock) return 1;
      if (!aIsOutOfStock && bIsOutOfStock) return -1;

      if (sortBySales === "most") {
        if (b.orderCount !== a.orderCount) {
          return b.orderCount - a.orderCount;
        }
      } else if (sortBySales === "least") {
        if (a.orderCount !== b.orderCount) {
          return a.orderCount - b.orderCount;
        }
      }

      const priceA = getProductPrice(a);
      const priceB = getProductPrice(b);

      if (sortByPrice === "high") {
        if (priceB !== priceA) return priceB - priceA;
      } else if (sortByPrice === "low") {
        if (priceA !== priceB) return priceA - priceB;
      }

      if (sortByType === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortByType === "date") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }

      return 0;
    });

  return (
    <div>
      <Helmet>
        <title>
          {category?.seoTitle ||
            (category?.name ? `${category.name} | Monorom` : "Monorom")}
        </title>
        <meta
          name="description"
          content={
            category?.seoDescription ||
            category?.slogan ||
            (category?.name
              ? `Shop ${category.name} from Monorom — quality ceramics and homeware in Bangladesh.`
              : "Shop quality ceramics at Monorom.")
          }
        />
        {category?.seoKeywords ? (
          <meta name="keywords" content={category.seoKeywords} />
        ) : null}
        <link
          rel="canonical"
          href={
            typeof window !== "undefined"
              ? `${window.location.origin}/category/${category?.slug || slug}`
              : `/category/${category?.slug || slug}`
          }
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={
            category?.seoTitle ||
            (category?.name ? `${category.name} | Monorom` : "Monorom")
          }
        />
        <meta
          property="og:description"
          content={
            category?.seoDescription ||
            category?.slogan ||
            (category?.name
              ? `Shop ${category.name} from Monorom.`
              : "Shop quality ceramics at Monorom.")
          }
        />
        <meta
          property="og:url"
          content={
            typeof window !== "undefined"
              ? `${window.location.origin}/category/${category?.slug || slug}`
              : `/category/${category?.slug || slug}`
          }
        />
        {category?.bannerImage || category?.categoryThumbnail ? (
          <meta
            property="og:image"
            content={category.bannerImage || category.categoryThumbnail}
          />
        ) : null}
        {category
          ? (
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                name: category.seoTitle || category.name,
                description:
                  category.seoDescription ||
                  category.slogan ||
                  `Shop ${category.name} at Monorom`,
                url:
                  typeof window !== "undefined"
                    ? `${window.location.origin}/category/${category.slug || slug}`
                    : `/category/${category.slug || slug}`,
                isPartOf: {
                  "@type": "WebSite",
                  name: "Monorom",
                },
              })}
            </script>
            )
          : null}
      </Helmet>
      <ToastContainer />
      <div
        className="bg-fixed bg-cover bg-center w-full relative mb-10"
        style={{
          backgroundImage: `url(${category?.bannerImage || ""})`,
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 py-[200px] text-center">
          <h1 className="md:text-8xl text-6xl text-white pb-5">{category?.name}</h1>
          <h3 className="text-3xl text-slate-300">
            {category?.slogan || ""}
          </h3>
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto md:pt-8 px-4 md:px-6">
        <div className="mb-20 hidden md:flex justify-between items-center gap-4">
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

          <div className="flex gap-2">
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

        <div className="mb-20 md:hidden space-y-4">
          <label className="input input-bordered flex items-center gap-2 w-full">
            <input
              type="text"
              className="grow"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
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

        <div
          ref={productsSectionRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-16 scroll-mt-4"
        >
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              user={user}
              index={index}
              categoryName={category?.name || ""}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const getDisplayPrice = (product) => getProductPrice(product);

const ProductCard = ({ product, user, index = 0, categoryName = "" }) => {
  const { addItem } = useCart();
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [qty, setQty] = useState(1);
  const [qtyError, setQtyError] = useState("");
  const [daysLeft, setDaysLeft] = useState(null);

  const outOfStock = !product?.stock || product.stock < 1;
  const lowStock =
    product?.stock >= 1 && product?.stock <= product?.panicStock;
  const price = getDisplayPrice(product);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (product?.offerPanicStarts) {
      const today = new Date();
      const offerTill = new Date(product?.offerTill);
      const offerPanicStarts = new Date(product?.offerPanicStarts);

      if (today >= offerPanicStarts) {
        const timeDiff = offerTill - today;
        setDaysLeft(Math.ceil(timeDiff / (1000 * 3600 * 24)));
      } else {
        setDaysLeft(null);
      }
    } else {
      setDaysLeft(null);
    }
  }, [product]);

  const handleAddToCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) {
      toast.error("This product is out of stock.");
      return;
    }
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
    setQty((prev) => Math.max(1, prev - 1));
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

  const handleConfirmAddToCart = () => {
    if (qty < 1 || qty > product.stock) {
      setQtyError(`Please enter a quantity between 1 and ${product.stock}`);
      return;
    }
    addItem({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      image: product.productThumbnail,
      category: categoryName,
      price,
      qty,
    });
    toast.success("Product Successfully Added to Your Cart!");
    setShowQtyModal(false);
  };

  return (
    <div
      ref={cardRef}
      className={`product-card-appear group/card ${isVisible ? "is-visible" : ""}`}
      style={{ animationDelay: `${Math.min(index, 11) * 110}ms` }}
    >
      <Link to={`/productDetails/${product?.slug || product?._id}`} className="block">
        <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
          <img
            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
            src={product?.productThumbnail}
            alt={product?.name}
            loading="lazy"
          />
          <div className="gradient-overlay absolute inset-0 pointer-events-none" />

          {/* Offer badge */}
          {product?.hasOffer && (
            <div className="absolute top-3 left-0 z-20">
              <div className="bg-gray-900 text-white px-2.5 py-1 text-[10px] md:text-xs font-medium tracking-wide">
                {daysLeft !== null && daysLeft >= 0
                  ? `Offer · ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`
                  : "Offer Available"}
              </div>
            </div>
          )}

          {/* Stock badge */}
          {(outOfStock || lowStock) && (
            <div className="absolute top-3 right-0 z-20">
              <div className="bg-gray-900 text-white px-2.5 py-1 text-[10px] md:text-xs font-medium tracking-wide">
                {outOfStock
                  ? "Out of Stock"
                  : `Only ${product.stock} left`}
              </div>
            </div>
          )}

          {/* Default name strip */}
          <div className="absolute bottom-3 left-3 right-3 z-10 transition-opacity duration-400 group-hover/card:opacity-0">
            <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5">
              <h3 className="text-gray-800 text-sm md:text-base font-semibold text-center truncate">
                {product?.name}
              </h3>
            </div>
          </div>

          {/* Hover overlay — homepage style */}
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 transition-all duration-400 group-hover/card:opacity-100 z-10">
            <div className="text-center transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-400 px-3">
              <h3 className="text-white text-base md:text-lg font-bold mb-2">
                {product?.name}
              </h3>
              {product?.specialLines?.length > 0 && (
                <div className="mb-3 space-y-0.5">
                  {product.specialLines.slice(0, 3).map((sl) => (
                    <p key={sl} className="text-white/85 text-xs md:text-sm">
                      {sl}
                    </p>
                  ))}
                </div>
              )}
              <div className="inline-block px-4 py-2 border border-white text-white font-semibold hover:bg-white hover:text-black transition-all duration-300 text-xs md:text-sm">
                View Product
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Price + cart — below image */}
      <div className="pt-3 pb-1 flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-2 px-0.5">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">
            {product?.name}
          </h3>
          <p className="text-sm md:text-base font-bold text-gray-900 whitespace-nowrap">
            Tk. {price}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddToCartClick}
          disabled={outOfStock}
          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-900 text-white text-sm font-medium hover:bg-white hover:text-gray-900 transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-900 disabled:hover:text-white"
        >
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>

      {showQtyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 w-80 relative shadow-2xl">
            <button
              type="button"
              className="absolute top-2 right-3 text-gray-400 hover:text-gray-800 text-2xl leading-none"
              onClick={() => setShowQtyModal(false)}
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-1 text-center text-gray-900">
              Select Quantity
            </h2>
            <p className="text-center text-sm text-gray-500 mb-4 truncate px-4">
              {product?.name}
            </p>
            <div className="mb-4 flex flex-col items-center">
              <div className="flex items-center border border-gray-200">
                <button
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-xl transition-colors"
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
                  className="px-3 py-2 w-16 text-center focus:outline-none border-x border-gray-200"
                />
                <button
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-xl transition-colors"
                  onClick={handleIncrement}
                  disabled={qty >= product.stock}
                  type="button"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-500 mt-2">
                Available: {product.stock}
              </span>
              {qtyError && (
                <span className="text-red-500 text-xs mt-1">{qtyError}</span>
              )}
            </div>
            <button
              type="button"
              className="bg-gray-900 border border-gray-900 text-white px-4 py-2.5 w-full font-medium hover:bg-white hover:text-gray-900 transition-colors duration-300 disabled:opacity-50"
              onClick={handleConfirmAddToCart}
              disabled={qty < 1 || qty > product.stock}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
