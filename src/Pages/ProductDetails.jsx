import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { FaRegStar, FaStar, FaYoutube } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../hooks/useAuthContext";
import { useCart } from "../context/CartContext";
import LoginModal from "../Components/LoginModal";
import SignupModal from "../Components/SignupModal";
import { RichTextContent } from "../Components/RichTextEditor";
import { getProductPrice } from "../utils/productPrice";
import { stripHtml } from "../utils/slugify";
import { BACKEND_URL } from "@/config";

const buildCartItem = (product, qty, user, categoryName = "") => ({
  productId: product._id,
  slug: product.slug,
  name: product.name,
  image: product.productThumbnail,
  category: categoryName,
  price: getProductPrice(product),
  qty,
});

const ProductDetails = () => {
  const { user } = useAuthContext();
  const { addItem, buyNow } = useCart();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(1);
  const [daysLeft, setDaysLeft] = useState(null);
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isSignupOpen, setSignupOpen] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  const increaseQuantity = () => {
    if (product.stock - quantity > 0) setQuantity((prev) => prev + 1);
    else toast.error("Out of Stock.!.");
  };

  const decreaseQuantity = () => {
    const minQuantity = product?.stock <= 0 ? 0 : 1;
    if (quantity > minQuantity) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;

    if (value === "") {
      setQuantity("");
      return;
    }

    const numValue = parseInt(value);
    if (isNaN(numValue)) return;

    if (numValue > product.stock) {
      setQuantity(product.stock);
      toast.error(`Cannot exceed available stock (${product.stock})`);
    } else if (numValue < 0) {
      setQuantity(0);
    } else if (numValue < 1 && product?.stock > 0) {
      setQuantity(1);
    } else {
      setQuantity(numValue);
    }
  };

  const handleQuantityBlur = () => {
    if (quantity === "") {
      const minQuantity = product?.stock <= 0 ? 0 : 1;
      setQuantity(minQuantity);
    } else if (quantity < 0) {
      setQuantity(0);
    } else if (quantity < 1 && product?.stock > 0) {
      setQuantity(1);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/product/${slug}`
      );
      if (!response.ok) throw new Error("Failed to fetch product");
      const data = await response.json();
      setProduct(data);
      setSelectedImage(data.productThumbnail);
      setImageKey((k) => k + 1);
      setAddedToCart(false);
      setQuantity(data.stock <= 0 ? 0 : 1);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const fetchCategory = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/category/${product?.category}`
      );
      if (!response.ok) throw new Error("Failed to fetch category");
      const data = await response.json();
      setCategory(data);
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  };

  const fetchRelatedProducts = async (currentProduct) => {
    const categoryId =
      currentProduct?.category?.toString?.() || currentProduct?.category;
    if (!categoryId) {
      setProducts([]);
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/product/getProductsByCategoryId/${categoryId}`
      );
      if (!response.ok) throw new Error("Failed to fetch related products");
      const data = await response.json();
      const related = (Array.isArray(data) ? data : []).filter(
        (item) => String(item._id) !== String(currentProduct._id)
      );
      setProducts(related);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  useEffect(() => {
    if (slug) {
      setProducts(null);
      setCategory(null);
      fetchProduct();
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [slug]);

  useEffect(() => {
    if (product?._id) {
      fetchCategory();
      fetchRelatedProducts(product);
    }
  }, [product?._id, product?.category]);

  useEffect(() => {
    if (user?.user?._id) {
      setLoginOpen(false);
      setSignupOpen(false);
    }
  }, [user?.user?._id]);

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

  const handleSelectImage = (im) => {
    if (im === selectedImage) return;
    setSelectedImage(im);
    setImageKey((k) => k + 1);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();

    if (product?.stock <= 0 || quantity <= 0) {
      toast.error("Product is out of stock!");
      return;
    }

    addItem(
      buildCartItem(product, quantity, user, category?.name || "")
    );
    toast.success("Product successfully added to your cart!");
    setAddedToCart(true);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();

    if (product?.stock <= 0 || quantity <= 0) {
      toast.error("Product is out of stock!");
      return;
    }

    buyNow(buildCartItem(product, quantity, user, category?.name || ""));
    toast.success("Ready to checkout!");
    navigate("/user/cart");
  };

  const unitPrice = getProductPrice(product);
  const displayPrice =
    product?.stock <= 0 ? unitPrice : unitPrice * (Number(quantity) || 0);
  const outOfStock = product?.stock <= 0;
  const lowStock =
    product?.stock > 0 && product?.stock <= product?.panicStock;
  const gallery = product?.galleryImages?.length
    ? product.galleryImages
    : product?.productThumbnail
      ? [product.productThumbnail]
      : [];

  const pageTitle =
    product?.seoTitle ||
    (product?.name ? `${product.name} | Monorom` : "Monorom");
  const plainDesc = stripHtml(product?.desc);
  const pageDescription =
    product?.seoDescription ||
    (plainDesc ? plainDesc.slice(0, 160) : "") ||
    (product?.name
      ? `Buy ${product.name} from Monorom. Quality ceramics and dinnerware.`
      : "Shop quality ceramics at Monorom.");
  const pageUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/productDetails/${product?.slug || slug}`
      : `/productDetails/${product?.slug || slug}`;
  const ogImage = product?.productThumbnail || product?.bannerImage || "";
  const productJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: pageDescription,
        image: [ogImage, ...(product.galleryImages || [])].filter(Boolean),
        sku: product.productCode || undefined,
        brand: { "@type": "Brand", name: "Monorom" },
        offers: {
          "@type": "Offer",
          url: pageUrl,
          priceCurrency: "BDT",
          price: unitPrice,
          availability: outOfStock
            ? "https://schema.org/OutOfStock"
            : "https://schema.org/InStock",
        },
      }
    : null;

  return (
    <div key={slug} className="max-w-7xl mx-auto px-4 md:px-6 pb-10 md:pb-14 pt-40 md:pt-48">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {product?.seoKeywords ? (
          <meta name="keywords" content={product.seoKeywords} />
        ) : null}
        <link rel="canonical" href={pageUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
        {productJsonLd ? (
          <script type="application/ld+json">
            {JSON.stringify(productJsonLd)}
          </script>
        ) : null}
      </Helmet>
      <ToastContainer />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Gallery */}
        <div className="pd-gallery-enter">
          <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
            {selectedImage && (
              <img
                key={imageKey}
                className="pd-main-image w-full h-full object-cover"
                src={selectedImage}
                alt={product?.name}
              />
            )}
            <div className="gradient-overlay absolute inset-0 pointer-events-none" />

            {product?.hasOffer && (
              <div className="absolute top-4 left-0 z-20">
                <div className="bg-gray-900 text-white px-3 py-1.5 text-xs md:text-sm font-medium tracking-wide">
                  {daysLeft !== null && daysLeft >= 0
                    ? `Offer · ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`
                    : "Offer Available"}
                </div>
              </div>
            )}

            {(outOfStock || lowStock) && (
              <div className="absolute top-4 right-0 z-20">
                <div className="bg-gray-900 text-white px-3 py-1.5 text-xs md:text-sm font-medium tracking-wide">
                  {outOfStock
                    ? "Out of Stock"
                    : `Only ${product?.stock} left`}
                </div>
              </div>
            )}
          </div>

          {gallery.length > 0 && (
            <div className="flex gap-3 mt-4 overflow-x-auto scrollbar-hide pb-1">
              {gallery.slice(0, 6).map((im, idx) => {
                const active = selectedImage === im;
                return (
                  <button
                    key={`${im}-${idx}`}
                    type="button"
                    onClick={() => handleSelectImage(im)}
                    className={`pd-thumb relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 overflow-hidden transition-all duration-300 ${
                      active
                        ? "ring-2 ring-gray-900 ring-offset-2"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <img
                      className="w-full h-full object-cover"
                      src={im}
                      alt={`${product?.name} view ${idx + 1}`}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {product?.youtubeURL && (
            <a
              href={product.youtubeURL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-gray-800 hover:text-red-600 transition-colors duration-300"
            >
              <FaYoutube className="text-3xl text-red-600" />
              <span className="text-sm font-medium tracking-wide uppercase">
                Watch video
              </span>
            </a>
          )}
        </div>

        {/* Product info */}
        <div className="pd-info-enter flex flex-col min-h-0 lg:min-h-[520px]">
          <p className="text-sm tracking-wide text-gray-500 mb-3">
            <Link
              to={`/category/${category?.slug || category?._id}`}
              className="hover:text-gray-900 transition-colors"
            >
              {category?.name || "Category"}
            </Link>
          </p>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            {product?.name}
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Code: {product?.productCode}
          </p>

          {product?.specialLines?.length > 0 && (
            <div className="mt-6 space-y-1.5 border-l-2 border-gray-900 pl-4">
              {product.specialLines.map((sl, index) => (
                <p className="text-gray-700 text-base md:text-lg" key={index}>
                  {sl}
                </p>
              ))}
            </div>
          )}

          <div className="mt-auto pt-10">
            <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Tk. {displayPrice ?? "—"}
            </p>

            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm text-gray-500 uppercase tracking-wider">
                Qty
              </span>
              <div className="flex items-center border border-gray-300">
                <button
                  type="button"
                  className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-40"
                  onClick={decreaseQuantity}
                  disabled={quantity <= (product?.stock <= 0 ? 0 : 1)}
                >
                  −
                </button>
                <input
                  type="text"
                  className="w-14 py-2.5 text-center focus:outline-none border-x border-gray-300"
                  value={quantity}
                  onChange={handleQuantityChange}
                  onBlur={handleQuantityBlur}
                />
                <button
                  type="button"
                  className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-40"
                  onClick={increaseQuantity}
                  disabled={product?.stock <= 0 || quantity >= product?.stock}
                >
                  +
                </button>
              </div>
              {!outOfStock && (
                <span className="text-sm text-gray-400">
                  {product?.stock} available
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {addedToCart ? (
                <Link
                  to="/user/cart"
                  className="flex-1 text-center px-6 py-3 border border-gray-900 bg-white text-gray-900 font-medium hover:bg-gray-900 hover:text-white transition-colors duration-300"
                >
                  Go to Cart
                </Link>
              ) : (
                <button
                  type="button"
                  className="flex-1 px-6 py-3 border border-gray-900 bg-white text-gray-900 font-medium hover:bg-gray-900 hover:text-white transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-900"
                  onClick={handleAddToCart}
                  disabled={quantity <= 0 || product?.stock <= 0}
                >
                  Add to Cart
                </button>
              )}
              <button
                type="button"
                className="flex-1 px-6 py-3 bg-gray-900 border border-gray-900 text-white font-medium hover:bg-white hover:text-gray-900 transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-900 disabled:hover:text-white"
                onClick={handleBuyNow}
                disabled={quantity <= 0 || product?.stock <= 0}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pd-section-enter mt-16 md:mt-20">
        <div className="flex justify-center gap-10 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab(1)}
            className={`pb-3 text-lg transition-colors relative ${
              activeTab === 1
                ? "text-gray-900 font-semibold"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            Description
            {activeTab === 1 && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-gray-900" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(2)}
            className={`pb-3 text-lg transition-colors relative ${
              activeTab === 2
                ? "text-gray-900 font-semibold"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            Reviews (0)
            {activeTab === 2 && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-gray-900" />
            )}
          </button>
        </div>

        <div className="py-10 max-w-3xl mx-auto text-center">
          {activeTab === 1 && (
            <RichTextContent
              html={product?.desc}
              className="text-base md:text-lg text-gray-600 leading-relaxed text-left"
            />
          )}
          {activeTab === 2 && (
            <div>
              <p className="text-gray-500 mb-6">There are no reviews yet</p>
              <div className="flex gap-1 justify-center pb-3 text-xl">
                <FaStar className="text-yellow-400" />
                <FaStar className="text-yellow-400" />
                <FaStar className="text-yellow-400" />
                <FaStar className="text-yellow-400" />
                <FaRegStar className="text-gray-300" />
              </div>
              <h5 className="text-lg font-semibold text-gray-900">
                Be the first to review this product
              </h5>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {products?.length > 0 && (
        <div className="pd-section-enter my-8 md:my-12">
          <h4 className="text-2xl md:text-3xl font-bold text-left text-gray-900 pb-8">
            Related Products
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.slice(0, 8).map((relatedProduct, index) => (
              <RelatedProductCard
                key={relatedProduct._id}
                product={relatedProduct}
                user={user}
                index={index}
                categoryName={category?.name || ""}
              />
            ))}
          </div>
        </div>
      )}

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setLoginOpen(false)}
        onOpenSignup={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
      />
      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setSignupOpen(false)}
        onOpenLogin={() => {
          setSignupOpen(false);
          setLoginOpen(true);
        }}
      />
    </div>
  );
};

export default ProductDetails;

const RelatedProductCard = ({ product, user, index = 0, categoryName = "" }) => {
  const { addItem } = useCart();
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [qty, setQty] = useState(1);
  const [qtyError, setQtyError] = useState("");
  const outOfStock = !product?.stock || product.stock < 1;
  const price = getProductPrice(product);

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
    addItem(buildCartItem(product, qty, user, categoryName));
    toast.success("Product Successfully Added to Your Cart!");
    setShowQtyModal(false);
  };

  return (
    <div
      className="product-card-appear is-visible group/card"
      style={{ animationDelay: `${Math.min(index, 7) * 90}ms` }}
    >
      <Link to={`/productDetails/${product.slug || product._id}`} className="block">
        <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
          <img
            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
            src={product.productThumbnail}
            alt={product.name}
            loading="lazy"
          />
          <div className="gradient-overlay absolute inset-0 pointer-events-none" />

          {product?.hasOffer && (
            <div className="absolute top-3 left-0 z-20">
              <div className="bg-gray-900 text-white px-2.5 py-1 text-[10px] md:text-xs font-medium">
                Offer Available
              </div>
            </div>
          )}

          {outOfStock && (
            <div className="absolute top-3 right-0 z-20">
              <div className="bg-gray-900 text-white px-2.5 py-1 text-[10px] md:text-xs font-medium">
                Out of Stock
              </div>
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-3 z-10 transition-opacity duration-400 group-hover/card:opacity-0">
            <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5">
              <h3 className="text-gray-800 text-sm md:text-base font-semibold text-center truncate">
                {product.name}
              </h3>
            </div>
          </div>

          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 transition-all duration-400 group-hover/card:opacity-100 z-10">
            <div className="text-center transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-400 px-3">
              <h3 className="text-white text-base md:text-lg font-bold mb-2">
                {product.name}
              </h3>
              <div className="inline-block px-4 py-2 border border-white text-white font-semibold text-xs md:text-sm">
                View Product
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="pt-3 pb-1 flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-2 px-0.5">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">
            {product.name}
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
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-xl"
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
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-xl"
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
