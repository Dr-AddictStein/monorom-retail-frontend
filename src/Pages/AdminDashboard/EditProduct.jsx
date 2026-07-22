import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Switch from "react-switch";
import { useAuthContext } from "../../hooks/useAuthContext";
import { uploadFile } from "../../utils/uploadFile";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    bannerImage: null,
    productThumbnail: null,
    galleryImages: [],
    category: "",
    price: "",
    priceBC: "",
    priceMC: "",
    priceFC: "",
    priceSC: "",
    specialLines: [""], // Initialize with one input field
    productCode: "",
    youtubeURL: "",
    desc: "",
    stock: 0,
    panicStock: 0,
    hasOffer: false,
    offerTill: "",
    offerPanicStarts:""
  });
  const [preview, setPreview] = useState({
    bannerImage: null,
    productThumbnail: null,
    galleryImages: [],
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/category/`
      );
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };


  const fetchProduct = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/product/${id}`
      );
      if (!response.ok) throw new Error("Failed to fetch product");
      const data = await response.json();
      setFormData(data);
      setPreview({
        bannerImage: data.bannerImage,
        productThumbnail: data.productThumbnail,
        galleryImages: data.galleryImages.map((img) => img), // Initialize previews
      });
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      if (name === "bannerImage") {
        setPreview({ ...preview, bannerImage: URL.createObjectURL(file) });
      } else if (name === "productThumbnail") {
        setPreview({ ...preview, productThumbnail: URL.createObjectURL(file) });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSpecialLineChange = (index, value) => {
    const newSpecialLines = [...formData.specialLines];
    newSpecialLines[index] = value;
    setFormData({ ...formData, specialLines: newSpecialLines });
  };

  const addSpecialLine = () => {
    setFormData({ ...formData, specialLines: [...formData.specialLines, ""] });
  };

  const deleteSpecialLine = (index) => {
    const newSpecialLines = [...formData.specialLines];
    newSpecialLines.splice(index, 1);
    setFormData({ ...formData, specialLines: newSpecialLines });
  };

  const handleGalleryImageChange = (index, e) => {
    const files = Array.from(e.target.files);
    const newGalleryImages = [...formData.galleryImages];

    if (files[0]) {
      newGalleryImages[index] = files[0]; // Update with the new file
      setPreview({
        ...preview,
        galleryImages: [
          ...preview.galleryImages.slice(0, index),
          URL.createObjectURL(files[0]), // Set the preview for the uploaded image
          ...preview.galleryImages.slice(index + 1),
        ],
      });
    } else if (!files[0] && newGalleryImages[index] === null) {
      newGalleryImages[index] = null; // Keep it null if no file selected
    }

    setFormData({ ...formData, galleryImages: newGalleryImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the data for submission
    const bannerImagePath = formData.bannerImage
      ? await uploadFile(formData.bannerImage)
      : formData.bannerImage;
    const productThumbnailPath = formData.productThumbnail
      ? await uploadFile(formData.productThumbnail)
      : formData.productThumbnail;

    const galleryImagePaths = await Promise.all(
      formData.galleryImages.map(async (file, index) => {
        // If it's an existing image path, retain it, otherwise upload
        return file instanceof File ? await uploadFile(file) : file || null;
      })
    );

    const productData = {
      name: formData.name,
      bannerImage: bannerImagePath,
      productThumbnail: productThumbnailPath,
      galleryImages: galleryImagePaths.filter((path) => path !== null),
      category: formData.category,
      price: formData.price,
      priceBC: formData.priceBC,
      priceMC: formData.priceMC,
      priceSC: formData.priceSC,
      priceFC: formData.priceFC,
      specialLines: formData.specialLines,
      productCode: formData.productCode,
      youtubeURL: formData.youtubeURL,
      desc: formData.desc,
      stock:formData.stock,
      panicStock:formData.panicStock,
      hasOffer:formData.hasOffer,
      offerTill: formData.offerTill,
      offerPanicStarts: formData.offerPanicStarts
    };

    await updateProduct(productData);
  };

  const addGalleryImage = () => {
    setFormData({
      ...formData,
      galleryImages: [...formData.galleryImages, null],
    });
    setPreview({ ...preview, galleryImages: [...preview.galleryImages, null] });
  };

  const deleteGalleryImage = (index) => {
    const newGalleryImages = [...formData.galleryImages];
    const newPreview = [...preview.galleryImages];

    // Remove the selected image from both arrays
    newGalleryImages.splice(index, 1);
    newPreview.splice(index, 1);

    setFormData({ ...formData, galleryImages: newGalleryImages });
    setPreview({ ...preview, galleryImages: newPreview });
  };

  const updateProduct = async (data) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/product/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error("Failed to update product");
      toast.success("Product updated successfully!");
      navigate(`/dashboard/admin/viewProduct/${id}`);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Error updating product. Please try again.");
    }
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
    <div className="p-4">
      <ToastContainer />
      <h2 className="text-2xl font-semibold mb-8 text-center">Edit Product</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="label">
            <span className="label-text">Product Name</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            required
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">Product Code</span>
          </label>
          <input
            type="text"
            name="productCode"
            value={formData.productCode}
            onChange={handleInputChange}
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">Category</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="select select-bordered w-full"
            required
          >
            <option value="">Select a Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">
            <span className="label-text">Price BC</span>
          </label>
          <input
            type="number"
            name="priceBC"
            value={formData.priceBC}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            required
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">Price MC</span>
          </label>
          <input
            type="number"
            name="priceMC"
            value={formData.priceMC}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            required
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">Price SC</span>
          </label>
          <input
            type="number"
            name="priceSC"
            value={formData.priceSC}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            required
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">Price FC</span>
          </label>
          <input
            type="number"
            name="priceFC"
            value={formData.priceFC}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            required
          />
        </div>
        
        <div>
          <label className="label">
            <span className="label-text">Stock</span>
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            // required
          />
        </div>
        
        <div>
          <label className="label">
            <span className="label-text">Panic Stock</span>
          </label>
          <input
            type="number"
            name="panicStock"
            value={formData.panicStock}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            // required
          />
        </div>
        
        <div>
          <label className="label">
            <span className="label-text">Available Offer</span>
          </label>
          <Switch onChange={()=>setFormData({ ...formData, hasOffer: (formData.hasOffer)?false:true })} checked={formData.hasOffer} />
        </div>

        {
          formData.hasOffer &&
          <div>
            <label className="label">
              <span className="label-text">Offer Available untill</span>
            </label>
            <input
              type="date"
              name="offerTill"
              value={formData.offerTill}
              onChange={handleInputChange}
              className="input input-bordered w-full"
            />
          </div>
          
        }

        {
          formData.hasOffer && 
          <div>
            <label className="label">
              <span className="label-text">Offer Panic Starts From</span>
            </label>
            <input
              type="date"
              name="offerPanicStarts"
              value={formData.offerPanicStarts}
              onChange={handleInputChange}
              className="input input-bordered w-full"
            />
          </div>
        }

        <div>
          <label className="label">
            <span className="label-text">Banner Image</span>
          </label>
          <input
            type="file"
            name="bannerImage"
            onChange={handleInputChange}
            className="input input-bordered"
          />
          {preview.bannerImage && (
            <img
              src={preview.bannerImage}
              alt="Banner Preview"
              className="mt-2 h-32 w-full object-cover"
            />
          )}
        </div>

        <div>
          <label className="label">
            <span className="label-text">Product Thumbnail</span>
          </label>
          <input
            type="file"
            name="productThumbnail"
            onChange={handleInputChange}
            className="input input-bordered"
          />
          {preview.productThumbnail && (
            <img
              src={preview.productThumbnail}
              alt="Thumbnail Preview"
              className="mt-2 h-32 w-full object-cover"
            />
          )}
        </div>

        <div>
          <label className="label">
            <span className="label-text">Gallery Images</span>
          </label>
          {formData.galleryImages.map((image, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="file"
                onChange={(e) => handleGalleryImageChange(index, e)}
                className="input input-bordered w-1/2"
              />
              <button
                type="button"
                onClick={() => deleteGalleryImage(index)}
                className="btn btn-danger ml-2"
              >
                Delete
              </button>
              {preview.galleryImages[index] && (
                <img
                  src={preview.galleryImages[index]}
                  alt={`Gallery Preview ${index + 1}`}
                  className="mt-2 h-32 w-32 object-cover ml-2"
                />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addGalleryImage}
            className="btn bg-slate-700 text-white"
          >
            Add Gallery Image
          </button>
        </div>

        <div>
          <label className="label">
            <span className="label-text">Special Lines</span>
          </label>
          {formData.specialLines.map((line, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={line}
                onChange={(e) => handleSpecialLineChange(index, e.target.value)}
                className="input input-bordered w-full"
                required
              />
              <button
                type="button"
                onClick={() => deleteSpecialLine(index)}
                className="btn btn-danger ml-2"
              >
                Delete
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSpecialLine}
            className="btn bg-slate-700 text-white"
          >
            Add Special Line
          </button>
        </div>

        <div>
          <label className="label">
            <span className="label-text">YouTube URL</span>
          </label>
          <input
            type="text"
            name="youtubeURL"
            value={formData.youtubeURL}
            onChange={handleInputChange}
            className="input input-bordered w-full"
          />
        </div>
        
        <div>
          <label className="label">
            <span className="label-text">Product Description</span>
          </label>
          <input
            type="text"
            name="desc"
            value={formData.desc}
            onChange={handleInputChange}
            className="input input-bordered w-full"
          />
        </div>

        <button type="submit" className="btn btn-success w-full text-white">
          Update Product
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
