import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RichTextContent } from "../../Components/RichTextEditor";
import { useAuthContext } from "../../hooks/useAuthContext";
import { getProductPrice } from "../../utils/productPrice";

const ViewProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const productResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/product/${id}`
      );
      if (!productResponse.ok) throw new Error("Failed to fetch product");
      const productData = await productResponse.json();
      setProduct(productData);

      const categoriesResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/category/`
      );
      if (!categoriesResponse.ok) throw new Error("Failed to fetch categories");
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching data. Please try again later.");
      setLoading(false);
    }
  };

  const { user } = useAuthContext();
  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center">Product not found.</div>;
  }

  // Find category name by ID
  const categoryName =
    categories.find((cat) => cat._id === product.category)?.name || "N/A";



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
    <div className="p-8 bg-gray-100">
      <ToastContainer />
      {/* Full-width Banner Image */}
      <img
        src={product.bannerImage}
        alt={product.name}
        className="w-full rounded-lg shadow-lg mb-4 object-cover"
        style={{ height: "400px", objectFit: "cover" }} // Adjust height as necessary
      />
      <h1 className="text-3xl font-bold my-8 text-center">{product.name}</h1>
      <div className="text-xl my-4 text-center max-w-3xl mx-auto">
        <strong>Description:</strong>
        <RichTextContent
          html={product.desc}
          className="mt-2 text-left"
        />
      </div>
      <div className="flex gap-12 mb-6">
        <div className="flex-1">
          <h2 className="text-xl font-semibold my-8">Product Thumbnail</h2>
          <img
            src={product.productThumbnail}
            alt={`${product.name} Thumbnail`}
            className="rounded-lg shadow-lg max-h-64 object-cover w-full"
          />
        </div>
        <div className="flex-1">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="my-6">
              <strong>Product Code:</strong> {product.productCode}
            </p>
            <p className="my-6">
              <strong>Category:</strong> {categoryName}
            </p>
            <p className="my-6">
              <strong>Price:</strong> tk {getProductPrice(product).toFixed(2)}/-
            </p>
            <p className="my-6">
              <strong>Stock:</strong> {(product.stock)||0}
            </p>
            <p className="my-6">
              <strong>Orders Received:</strong> {(product.orderCount)||0}
            </p>
            <p className="my-6">
              <strong>Offer Availability:</strong> {(product.hasOffer)?"Yes":"No"}
            </p>
            <p className="my-6">
              <strong>YouTube URL:</strong> {product.youtubeURL}
            </p>
            <h3 className="text-lg font-semibold mt-4">Special Lines</h3>
            <ul className="list-disc list-inside">
              {product.specialLines?.length > 0 ? (
                product.specialLines.map((line, index) => (
                  <li key={index}>{line}</li>
                ))
              ) : (
                <li>No special lines available.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Gallery Images</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {product.galleryImages.length > 0 ? (
            product.galleryImages.map((image, index) => (
              <div key={index} className="bg-white p-2 rounded-lg shadow-md">
                <img
                  src={image}
                  alt={`Gallery Image ${index + 1}`}
                  className="w-full rounded-lg object-cover"
                />
              </div>
            ))
          ) : (
            <p>No gallery images available.</p>
          )}
        </div>
      </div>
      <Link to={`/dashboard/admin/editProduct/${id}`}>
        <button
          type="submit"
          className="mt-10 btn bg-slate-800 w-full text-white"
        >
          Edit Product
        </button>
      </Link>
    </div>
  );
};

export default ViewProduct;
