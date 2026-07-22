import axios from "axios";
import { useEffect, useState } from "react";
import { FaRegHeart, FaRegStar, FaStar } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../hooks/useAuthContext";
import offerImg from "../../public/offer-removebg-preview.png";
import outOfStockImg from "../../public/out of stock.png";
import LoginModal from "../Components/LoginModal";
import SignupModal from "../Components/SignupModal";

const ProductDetails = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState(null);

  const [quantity, setQuantity] = useState(1);

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
    
    // Allow empty field during typing
    if (value === '') {
      setQuantity('');
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

  // Handle blur to ensure valid value when user finishes typing
  const handleQuantityBlur = () => {
    if (quantity === '') {
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
        `${import.meta.env.VITE_BACKEND_URL}/api/product/${id}`
      );
      if (!response.ok) throw new Error("Failed to fetch product");
      const data = await response.json();
      setProduct(data);
      setSelectedImage(data.productThumbnail);
      setAddedToCart(false);
      // Set initial quantity based on stock availability
      setQuantity(data.stock <= 0 ? 0 : 1);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const fetchCategory = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/category/${product?.category}`
      );
      if (!response.ok) throw new Error("Failed to fetch category");
      const data = await response.json();
      setCategory(data);
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/product/getProductsByCategoryId/${product.category}`
      );
      if (!response.ok) throw new Error("Failed to fetch related products");
      const data = await response.json();
      const dex = data.filter((item) => item._id !== product._id);
      setProducts(dex);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchCategory();
      fetchRelatedProducts();
    }
  }, [product]);

  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isSignupOpen, setSignupOpen] = useState(false);

  useEffect(() => {
    if (user?.user?._id) {
      setLoginOpen(false);
      setSignupOpen(false);
    }
  }, [user?.user?._id])

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user?.user?._id) {
      setLoginOpen(true);
      return;
    }
    
    // Check if product is out of stock or quantity is 0
    if (product?.stock <= 0 || quantity <= 0) {
      toast.error("Product is out of stock!");
      return;
    }
    
    const data = { userId: user?.user?._id, productId: product?._id, qty: quantity };
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart/addToCart/${user?.user?._id
        }`,
        data
      );
      if (response.status === 200) {
        toast.success("Product successfully added to your cart!");
        setAddedToCart(true);
      } else {
        toast.error("Failed to add product to cart.");
      }
    } catch (error) {
      toast.error("Error adding to cart: " + error.message);
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    if (!user?.user?._id) {
      setLoginOpen(true);
      return;
    }
    
    // Check if product is out of stock or quantity is 0
    if (product?.stock <= 0 || quantity <= 0) {
      toast.error("Product is out of stock!");
      return;
    }
    
    const data = { userId: user?.user?._id, productId: product?._id };
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart/buyNow/${user?.user?._id
        }`,
        data
      );
      if (response.status === 200) {
        toast.success("Product successfully added to your cart!");
        navigate("/dashboard/user/cart");
      } else {
        toast.error("Failed to add product to cart.");
      }
    } catch (error) {
      toast.error("Error adding to cart: " + error.message);
    }
  };

  const [activeTab, setActiveTab] = useState(1);


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
    <div className="max-w-5xl mx-auto py-8 pt-[13%]  md:pt-[8%]">
      <ToastContainer />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative p-10 rounded-lg bg-slate-100 shadow-lg">
        <div className="relative">
          <div className=" absolute ">
            {product?.hasOffer && daysLeft !== null && daysLeft >= 0 && (
              <div className="bg-slate-900 text-white px-2 py-1 rounded-r-box font-medium">
                Offer Available - {daysLeft} day{daysLeft > 1 ? "s" : ""} left
              </div>
            )}
            {product?.hasOffer && daysLeft === null && (
              <div className="bg-slate-900 text-white px-2 py-1 rounded-r-box font-medium">
                Offer Available
              </div>
            )}
          </div>
          <div className=" absolute right-0 ">
            {(product?.stock <= product?.panicStock) &&
              <div className="bg-slate-900 text-white px-2 py-1 rounded-l-box font-medium">
                Only {product?.stock} available
              </div>
            }
          </div>
          <img
            className="w-full h-[340px] object-cover rounded-lg shadow-lg mb-4"
            src={selectedImage}
            alt={product?.name}
          />
          <div className="flex justify-center mt-2 space-x-2">
            {product?.galleryImages?.slice(0, 4).map((im) => (
              <div
                key={im}
                className="w-24 h-16 border rounded cursor-pointer overflow-hidden transition-transform transform hover:scale-105"
                onClick={() => setSelectedImage(im)}
              >
                <img
                  className="w-full h-full object-cover"
                  src={im}
                  alt="Product Thumbnail"
                />
              </div>
            ))}
          </div>
          {
            product?.youtubeURL &&
            <div className="text-center my-8 text-xl flex justify-center items-center">
              <a href={`${product?.youtubeURL}`} target="_blank" rel="noopener noreferrer" className="flex justify-center w-[75px]">
                <svg fill="#000000" height="75px" width="75px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 310 310" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="XMLID_822_"> <path id="XMLID_823_" d="M297.917,64.645c-11.19-13.302-31.85-18.728-71.306-18.728H83.386c-40.359,0-61.369,5.776-72.517,19.938 C0,79.663,0,100.008,0,128.166v53.669c0,54.551,12.896,82.248,83.386,82.248h143.226c34.216,0,53.176-4.788,65.442-16.527 C304.633,235.518,310,215.863,310,181.835v-53.669C310,98.471,309.159,78.006,297.917,64.645z M199.021,162.41l-65.038,33.991 c-1.454,0.76-3.044,1.137-4.632,1.137c-1.798,0-3.592-0.484-5.181-1.446c-2.992-1.813-4.819-5.056-4.819-8.554v-67.764 c0-3.492,1.822-6.732,4.808-8.546c2.987-1.814,6.702-1.938,9.801-0.328l65.038,33.772c3.309,1.718,5.387,5.134,5.392,8.861 C204.394,157.263,202.325,160.684,199.021,162.41z"></path> </g> </g></svg>
              </a>
            </div>
          }
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <p className="pb-4 text-sm text-gray-500">
              <Link
                to={`/category/${category?._id}`}
                className="hover:text-blue-500 cursor-pointer"
              >
                {category?.name}
              </Link>
            </p>
            <h3 className="text-3xl font-bold text-center">{product?.name}</h3>
            <p className="text-sm  text-center pt-4">Code: {product?.productCode}</p>
            <div className="pt-5">
              {product?.specialLines?.map((sl, index) => (
                <p className="text-center text-lg text-gray-700" key={index}>
                  {sl}
                </p>
              ))}
            </div>
          </div>
          <div className="text-xl text-right">
            {user?.user?.userView === "BC" && (
              <h3 className="text-2xl pt-2 pb-4 text-center">
                tk {product?.stock <= 0 ? product?.priceBC : product?.priceBC * quantity}/-
              </h3>
            )}
            {user?.user?.userView === "MC" && (
              <h3 className="text-2xl pt-2 pb-4 text-center">
                tk {product?.stock <= 0 ? product?.priceMC : product?.priceMC * quantity}/-
              </h3>
            )}
            {(!user || user?.user?.userView === "FC") && (
              <h3 className="text-2xl pt-2 pb-4 text-center">
                tk {product?.stock <= 0 ? product?.priceFC : product?.priceFC * quantity}/-
              </h3>
            )}
            {user?.user?.userView === "SC" && (
              <h3 className="text-2xl pt-2 pb-4 text-center">
                tk {product?.stock <= 0 ? product?.priceSC : product?.priceSC * quantity}/-
              </h3>
            )}
            <div className="flex items-center justify-center mb-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded-l-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                onClick={decreaseQuantity}
                disabled={quantity <= (product?.stock <= 0 ? 0 : 1)}
              >
                -
              </button>
              <input
                type="text"
                className="px-2 py-2 w-16 bg-white border-t border-b text-center"
                value={quantity}
                onChange={handleQuantityChange}
                onBlur={handleQuantityBlur}
                min="0"
                max={product?.stock}
              />
              <button
                className="px-4 py-2 bg-gray-200 rounded-r-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                onClick={increaseQuantity}
                disabled={product?.stock <= 0 || quantity >= product?.stock}
              >
                +
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {addedToCart ? (
                <Link
                  className="flex justify-center"
                  to={"/dashboard/user/cart"}
                >
                  <button className="bg-[#f2f1f1] text-black rounded-full px-4 py-2 transition-colors duration-200 hover:bg-gray-300">
                    Added to Cart, Go to Your Cart
                  </button>
                </Link>
              ) : (
                <button
                  className="bg-[#f2f1f1] text-black rounded-full px-4 py-2 transition-colors duration-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                  onClick={handleAddToCart}
                  disabled={quantity <= 0 || product?.stock <= 0}
                >
                  Add to Cart
                </button>
              )}
              <button
                className="bg-[#212121] text-white rounded-full px-4 py-2 transition-colors duration-200 hover:bg-[#0681c3] disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={handleBuyNow}
                disabled={quantity <= 0 || product?.stock <= 0}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-2xl flex justify-center gap-10 my-10">
        <h4
          onClick={() => setActiveTab(1)}
          className={`cursor-pointer ${activeTab === 1 ? "text-[#0681c3] font-semibold" : "text-gray-600"
            }`}
        >
          Description
        </h4>
        <h4
          onClick={() => setActiveTab(2)}
          className={`cursor-pointer ${activeTab === 2 ? "text-[#0681c3] font-semibold" : "text-gray-600"
            }`}
        >
          Reviews (0)
        </h4>
      </div>
      {activeTab === 1 && (
        <div className="text-lg text-gray-700 text-center">
          <p>
            {product?.desc}
          </p>
        </div>
      )}
      {activeTab === 2 && (
        <div className="text-lg text-gray-700 text-center">
          <p>There are no reviews yet</p>
          <div className="pt-10">
            <div className="text-xl flex gap-1 pb-4 justify-center">
              <FaStar className="text-yellow-400" />
              <FaStar className="text-yellow-400" />
              <FaStar className="text-yellow-400" />
              <FaStar className="text-yellow-400" />
              <FaRegStar className="text-gray-300" />
            </div>
            <h5 className="text-xl font-semibold">
              Be the first to review this product
            </h5>
          </div>
        </div>
      )}
      {products && (
        <div className="my-16">
          <h4 className="text-2xl text-center pb-5">Related Products</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((relatedProduct) => (
              <RelatedProductCard key={relatedProduct._id} product={relatedProduct} user={user} />
            ))}
          </div>
        </div>
      )
      }

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
    </div >
  );
};

export default ProductDetails;

const RelatedProductCard = ({ product, user }) => {
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
    if (!user?.user?._id) {
      toast.error("Please login to add to cart.");
      return;
    }
    const data = { userId: user?.user?._id, productId: product._id, qty };
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart/addToCart/` + user?.user?._id,
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

  return (
    <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
      <Link to={`/productDetails/${product._id}`}>
        <div className=" absolute top-0 left-0">
          {product?.hasOffer &&
            <img src={offerImg} alt="" className="w-24" />
          }
        </div>
        <img
          className="w-full h-[200px] object-cover rounded mb-4"
          src={product.productThumbnail}
          alt={product.name}
        />
        <h5 className="font-bold">{product.name}</h5>
        {user?.user?.userView === "BC" && <p className="text-xl text-[#0681c3]">
          tk {product.priceBC}/-
        </p>}
        {user?.user?.userView === "MC" && <p className="text-xl text-[#0681c3]">
          tk {product.priceMC}/-
        </p>}
        {user?.user?.userView === "SC" && <p className="text-xl text-[#0681c3]">
          tk {product.priceSC}/-
        </p>}
        {(!user || user?.user?.userView === "FC") && <p className="text-xl text-[#0681c3]">
          tk {product.priceFC}/-
        </p>}
      </Link>
      {user?.user?._id && (
        <>
          <button
            onClick={handleAddToCartClick}
            className="bg-[#212121] rounded-lg p-2 text-white mt-4 text-xl w-full"
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
