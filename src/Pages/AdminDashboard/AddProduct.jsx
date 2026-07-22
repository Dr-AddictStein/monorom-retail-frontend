import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Switch from "react-switch";
import { useAuthContext } from "../../hooks/useAuthContext";

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    bannerImage: null,
    productThumbnail: null,
    galleryImages: [],
    subCategory: "",
    subSubCategory: "",
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
    offerPanicStarts: ""
  });
  const [preview, setPreview] = useState({
    bannerImage: null,
    productThumbnail: null,
    galleryImages: [],
  });
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [subCatList, setSubCatList] = useState([]);
  const [subSubCatList, setSubSubCatList] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
    fetchSubSubCategories();
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

  const fetchSubCategories = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/subcategory/`
      );
      if (!response.ok) throw new Error("Failed to fetch subcategories");
      const data = await response.json();
      setSubCategories(data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const fetchSubSubCategories = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/subsubcategory/`
      );
      if (!response.ok) throw new Error("Failed to fetch subcategories");
      const data = await response.json();
      setSubSubCategories(data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
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
      if (name === "category") {
        let dex = subCategories.filter((cat) => cat.category === value);
        setSubCatList(dex);
        console.log(",dex", dex)
        setFormData({ ...formData, [name]: value });
      }
      else if (name === "subCategory") {
        let subCat = subCategories.find((sc) => sc._id === value);
        let dex = subCat.subSubCategories;
        let dex2 = [];
        for (let i = 0; i < dex.length; i++) {
          dex2.push(subSubCategories.find((ss) => ss._id === dex[i]));
        }
        console.log(",dextuu", dex2)
        setSubSubCatList(dex2);
        setFormData({ ...formData, [name]: value });
      }
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

  const handleGalleryImageChange = (index, e) => {
    const files = Array.from(e.target.files);
    const newGalleryImages = [...formData.galleryImages];
    newGalleryImages[index] = files[0];
    setFormData({ ...formData, galleryImages: newGalleryImages });
    setPreview({
      ...preview,
      galleryImages: [...preview.galleryImages, URL.createObjectURL(files[0])],
    });
  };

  const addGalleryImage = () => {
    setFormData({
      ...formData,
      galleryImages: [...formData.galleryImages, null],
    });
    setPreview({ ...preview, galleryImages: [...preview.galleryImages, null] });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bannerImagePath = await uploadFile(formData.bannerImage);
    const productThumbnailPath = await uploadFile(formData.productThumbnail);
    const galleryImagePaths = await Promise.all(
      formData.galleryImages.map((file) => uploadFile(file))
    );

    const productData = {
      name: formData.name,
      bannerImage: bannerImagePath,
      productThumbnail: productThumbnailPath,
      galleryImages: galleryImagePaths,
      subSubCategory: formData.subSubCategory,
      subCategory: formData.subCategory,
      category: formData.category,
      priceBC: formData.priceBC,
      priceMC: formData.priceMC,
      priceSC: formData.priceSC,
      priceFC: formData.priceFC,
      specialLines: formData.specialLines,
      productCode: formData.productCode,
      youtubeURL: formData.youtubeURL,
      desc: formData.desc,
      stock: formData.stock,
      panicStock: formData.panicStock,
      hasOffer: formData.hasOffer,
      offerTill: formData.offerTill,
      offerPanicStarts: formData.offerPanicStarts
    };

    await createProduct(productData);
  };

  const createProduct = async (data) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/product/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error("Failed to add product");
      toast.success("Product added successfully!");
      // Reset form or redirect as needed
      setFormData({
        name: "",
        bannerImage: null,
        productThumbnail: null,
        galleryImages: [],
        subCategory: "",
        subSubCategory: "",
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
        offerPanicStarts: ""
      });
      setPreview({
        bannerImage: null,
        productThumbnail: null,
        galleryImages: [],
      });
      navigate("/dashboard/admin/product");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Error adding product. Please try again.");
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
      <h2 className="text-2xl font-semibold mb-8 text-center">Add Product</h2>
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


        {
          !formData.category &&
          <div>
            <label className="label">
              <span className="label-text">Sub-Category</span>
            </label>
            <select
              name="subCategory"
              value={formData.subCategory}
              onChange={handleInputChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">Select a Sub-Category</option>
              {subCategories.map((subCategory) => (
                <option key={subCategory._id} value={subCategory._id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>
        }
        {
          formData.category &&
          <div>
            <label className="label">
              <span className="label-text">Sub-Category</span>
            </label>
            <select
              name="subCategory"
              value={formData.subCategory}
              onChange={handleInputChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">Select a Sub-Category</option>
              {subCatList?.map((subCategory) => (
                <option key={subCategory._id} value={subCategory._id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>
        }


        {
          !formData.subCategory &&
          <div>
            <label className="label">
              <span className="label-text">Sub-Sub-Category</span>
            </label>
            <select
              name="subSubCategory"
              value={formData.subSubCategory}
              onChange={handleInputChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">Select a Sub-Sub-Category</option>
              {subSubCategories.map((subSubCategory) => (
                <option key={subSubCategory._id} value={subSubCategory._id}>
                  {subSubCategory.name}
                </option>
              ))}
            </select>
          </div>
        }

        {
          formData.subCategory &&
          <div>
            <label className="label">
              <span className="label-text">Sub-Sub-Category</span>
            </label>
            <select
              name="subSubCategory"
              value={formData.subSubCategory}
              onChange={handleInputChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">Select a Sub-Sub-Category</option>
              {subSubCatList.map((subSubCategory) => (
                <option key={subSubCategory._id} value={subSubCategory._id}>
                  {subSubCategory?.name}
                </option>
              ))}
            </select>
          </div>
        }




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
            required
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
            required
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">Available Offer</span>
          </label>
          <Switch onChange={() => setFormData({ ...formData, hasOffer: (formData.hasOffer) ? false : true })} checked={formData.hasOffer} />
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
            required
          />
          {preview.bannerImage && (
            <img
              src={preview.bannerImage}
              alt="Banner Preview"
              className="mt-4 rounded-lg w-full max-h-60 object-cover"
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
            required
          />
          {preview.productThumbnail && (
            <img
              src={preview.productThumbnail}
              alt="Thumbnail Preview"
              className="mt-4 rounded-lg w-full max-h-60 object-cover"
            />
          )}
        </div>

        <div>
          <label className="label">
            <span className="label-text">Special Lines</span>
          </label>
          {formData.specialLines.map((line, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={line}
                onChange={(e) => handleSpecialLineChange(index, e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>
          ))}
          <button type="button" onClick={addSpecialLine} className="btn mt-2">
            Add More
          </button>
        </div>

        <div>
          <label className="label">
            <span className="label-text">Gallery Images</span>
          </label>
          {formData.galleryImages.map((image, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="file"
                onChange={(e) => handleGalleryImageChange(index, e)}
                className="input input-bordered"
                required
              />
              {preview.galleryImages[index] && (
                <img
                  src={preview.galleryImages[index]}
                  alt={`Gallery Preview ${index + 1}`}
                  className="mt-4 rounded-lg w-24 max-h-24 object-cover"
                />
              )}
            </div>
          ))}
          <button type="button" onClick={addGalleryImage} className="btn mt-2">
            Add More Gallery Image
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


        <button type="submit" className="btn btn-primary mt-4">
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
