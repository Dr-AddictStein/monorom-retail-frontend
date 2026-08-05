import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Switch from "react-switch";
import ProductSeoFields from "../../Components/ProductSeoFields";
import RichTextEditor from "../../Components/RichTextEditor";
import { useAuthContext } from "../../hooks/useAuthContext";
import { getProductPrice } from "../../utils/productPrice";
import { toSlug } from "../../utils/slugify";
import { uploadFile } from "../../utils/uploadFile";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    bannerImage: null,
    productThumbnail: null,
    galleryImages: [],
    category: "",
    price: "",
    specialLines: [],
    productCode: "",
    youtubeURL: "",
    desc: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    seoFocusKeyword: "",
    stock: 0,
    panicStock: 0,
    hasOffer: false,
    offerTill: "",
    offerPanicStarts: "",
  });
  const [preview, setPreview] = useState({
    bannerImage: null,
    productThumbnail: null,
    galleryImages: [],
  });
  const [categories, setCategories] = useState([]);
  const [productLoaded, setProductLoaded] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [id]);

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
      setProductLoaded(false);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/product/${id}`
      );
      if (!response.ok) throw new Error("Failed to fetch product");
      const data = await response.json();
      const lines = Array.isArray(data.specialLines)
        ? data.specialLines.filter((line) => line != null && String(line).trim() !== "")
        : [];
      const resolvedPrice =
        data.price != null && data.price !== ""
          ? data.price
          : getProductPrice(data);

      // Map fields explicitly so existing values are preserved for editing
      setFormData({
        name: data.name || "",
        slug: data.slug || toSlug(data.name || ""),
        bannerImage: data.bannerImage || null,
        productThumbnail: data.productThumbnail || null,
        galleryImages: Array.isArray(data.galleryImages) ? [...data.galleryImages] : [],
        category: data.category ? String(data.category) : "",
        price: resolvedPrice !== 0 || data.price === 0 ? resolvedPrice : "",
        specialLines: lines,
        productCode: data.productCode || "",
        youtubeURL: data.youtubeURL || "",
        desc: data.desc || "",
        seoTitle: data.seoTitle || "",
        seoDescription: data.seoDescription || "",
        seoKeywords: data.seoKeywords || "",
        seoFocusKeyword: data.seoFocusKeyword || "",
        stock: data.stock ?? 0,
        panicStock: data.panicStock ?? 0,
        hasOffer: Boolean(data.hasOffer),
        offerTill: data.offerTill || "",
        offerPanicStarts: data.offerPanicStarts || "",
      });
      setPreview({
        bannerImage: data.bannerImage || null,
        productThumbnail: data.productThumbnail || null,
        galleryImages: Array.isArray(data.galleryImages) ? [...data.galleryImages] : [],
      });
      setProductLoaded(true);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product for editing.");
      setProductLoaded(false);
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
    } else if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: toSlug(value),
      }));
    } else if (name === "slug") {
      setFormData((prev) => ({ ...prev, slug: toSlug(value) }));
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
      newGalleryImages[index] = files[0];
      setPreview({
        ...preview,
        galleryImages: [
          ...preview.galleryImages.slice(0, index),
          URL.createObjectURL(files[0]),
          ...preview.galleryImages.slice(index + 1),
        ],
      });
    } else if (!files[0] && newGalleryImages[index] === null) {
      newGalleryImages[index] = null;
    }

    setFormData({ ...formData, galleryImages: newGalleryImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only upload newly selected File objects; keep existing URL strings as-is
    const bannerImagePath =
      formData.bannerImage instanceof File
        ? await uploadFile(formData.bannerImage)
        : formData.bannerImage;
    const productThumbnailPath =
      formData.productThumbnail instanceof File
        ? await uploadFile(formData.productThumbnail)
        : formData.productThumbnail;

    const galleryImagePaths = await Promise.all(
      formData.galleryImages.map(async (file) => {
        return file instanceof File ? await uploadFile(file) : file || null;
      })
    );

    const productData = {
      name: formData.name,
      slug: formData.slug || toSlug(formData.name),
      bannerImage: bannerImagePath,
      productThumbnail: productThumbnailPath,
      galleryImages: galleryImagePaths.filter((path) => path !== null),
      category: formData.category,
      price: formData.price,
      specialLines: formData.specialLines.filter((line) => line.trim() !== ""),
      productCode: formData.productCode,
      youtubeURL: formData.youtubeURL,
      desc: formData.desc,
      seoTitle: formData.seoTitle,
      seoDescription: formData.seoDescription,
      seoKeywords: formData.seoKeywords,
      seoFocusKeyword: formData.seoFocusKeyword,
      stock: formData.stock,
      panicStock: formData.panicStock,
      hasOffer: formData.hasOffer,
      offerTill: formData.offerTill,
      offerPanicStarts: formData.offerPanicStarts,
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
          <Link to={"/login"} className="px-3 py-2 bg-emerald-700 rounded-md text-xl text-white">
            <button>Login</button>
          </Link>
          <Link to={"/signup"} className="px-3 py-2 bg-slate-700 rounded-md text-xl text-white">
            <button>SignUp</button>
          </Link>
        </div>
      </div>
    );
  }

  if (user?.user?.role !== "admin") {
    return (
      <div className="h-[100vh] flex flex-col justify-center">
        <div className="text-5xl text-center">Access Denied.!.</div>
        <div className="text-2xl text-center pt-5">
          This page can only be accessed by the Admin
        </div>
      </div>
    );
  }

  if (!productLoaded) {
    return (
      <div className="p-4">
        <ToastContainer />
        <h2 className="text-2xl font-semibold mb-8 text-center">Edit Product</h2>
        <p className="text-center">Loading product...</p>
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
            <span className="label-text">URL Slug</span>
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            placeholder="auto-generated-from-product-name"
          />
          <p className="text-xs text-base-content/50 mt-1">
            Used in URL: /productDetails/{formData.slug || "your-slug"}
          </p>
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
            <span className="label-text">Price</span>
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="input input-bordered w-full"
            required
            min="0"
            step="any"
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
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">Available Offer</span>
          </label>
          <Switch
            onChange={() =>
              setFormData({ ...formData, hasOffer: formData.hasOffer ? false : true })
            }
            checked={formData.hasOffer}
          />
        </div>

        {formData.hasOffer && (
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
        )}

        {formData.hasOffer && (
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
        )}

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
          {formData.specialLines.length === 0 ? (
            <button
              type="button"
              onClick={addSpecialLine}
              className="btn bg-slate-700 text-white"
            >
              Add One
            </button>
          ) : (
            <>
              {formData.specialLines.map((line, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={line}
                    onChange={(e) => handleSpecialLineChange(index, e.target.value)}
                    className="input input-bordered w-full"
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
                Add more
              </button>
            </>
          )}
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
          <RichTextEditor
            value={formData.desc}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, desc: value }))
            }
            placeholder="Write a detailed product description..."
          />
        </div>

        <ProductSeoFields
          formData={formData}
          onChange={handleInputChange}
          onFieldUpdate={(name, value) =>
            setFormData((prev) => ({ ...prev, [name]: value }))
          }
          generateEndpoint="/api/ai/product/generateSeo"
          nameMissingMessage="Enter the product name first, then generate SEO."
          buildPayload={(field) => ({
            field,
            name: formData.name,
            productCode: formData.productCode,
            categoryName:
              categories.find((c) => String(c._id) === String(formData.category))
                ?.name || "",
            desc: formData.desc,
            specialLines: formData.specialLines,
            price: formData.price,
            seoFocusKeyword: formData.seoFocusKeyword,
            seoTitle: formData.seoTitle,
            seoDescription: formData.seoDescription,
            seoKeywords: formData.seoKeywords,
          })}
        />

        <button type="submit" className="btn btn-success w-full text-white">
          Update Product
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
