import React, { useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductSeoFields from "../../Components/ProductSeoFields";
import { useAuthContext } from "../../hooks/useAuthContext";
import { uploadFile } from "../../utils/uploadFile";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "@/config";

const emptySeoForm = {
  name: "",
  slug: "",
  slogan: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  seoFocusKeyword: "",
};

const AdminCategory = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    slogan: "",
    bannerImage: null,
    categoryThumbnail: null,
  });
  const [preview, setPreview] = useState({
    bannerImage: null,
    categoryThumbnail: null,
  });
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [seoCategoryId, setSeoCategoryId] = useState(null);
  const [seoForm, setSeoForm] = useState(emptySeoForm);
  const [seoSaving, setSeoSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/category/`
      );
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };


  const toSlugPreview = (text) =>
    String(text || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      setPreview({ ...preview, [name]: URL.createObjectURL(file) });
    } else if (name === "name") {
      // Auto-fill slug from name only while creating (not editing)
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: editCategoryId ? prev.slug : toSlugPreview(value),
      }));
    } else if (name === "slug") {
      setFormData({ ...formData, slug: toSlugPreview(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let bannerImagePath = "";
    let thumbnailPath = "";

    // Upload new files if provided, otherwise retain existing paths
    if (formData.bannerImage) {
      bannerImagePath = await uploadFile(formData.bannerImage);
    } else if (editCategoryId) {
      const existingCategory = categories.find(
        (cat) => cat._id === editCategoryId
      );
      bannerImagePath = existingCategory.bannerImage; // Retain existing image
    }

    if (formData.categoryThumbnail) {
      thumbnailPath = await uploadFile(formData.categoryThumbnail);
    } else if (editCategoryId) {
      const existingCategory = categories.find(
        (cat) => cat._id === editCategoryId
      );
      thumbnailPath = existingCategory.categoryThumbnail; // Retain existing image
    }

    const categoryData = {
      name: formData.name,
      slug: formData.slug || toSlugPreview(formData.name),
      slogan: formData.slogan,
      bannerImage: bannerImagePath,
      categoryThumbnail: thumbnailPath,
    };

    if (editCategoryId) {
      await updateCategory(editCategoryId, categoryData);
    } else {
      await createCategory(categoryData);
    }

    // Reset form data and close modal
    resetForm();
  };

  const createCategory = async (data) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/category/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error("Failed to add category");
      toast.success("Category added successfully!");
      fetchCategories();
      document.getElementById("category_modal").close();
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Error adding category. Please try again.");
    }
  };

  const updateCategory = async (categoryId, data) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/category/${categoryId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error("Failed to update category");
      toast.success("Category updated successfully!");
      fetchCategories();
      document.getElementById("category_modal").close();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Error updating category. Please try again.");
    }
  };

  const handleEdit = (category) => {
    setEditCategoryId(category._id);
    setFormData({
      name: category.name,
      slug: category.slug || "",
      slogan: category?.slogan,
      bannerImage: null,
      categoryThumbnail: null,
    });
    setPreview({
      bannerImage: category.bannerImage,
      categoryThumbnail: category.categoryThumbnail,
    });
    document.getElementById("category_modal").showModal();
  };

  const handleOpenSeo = (category) => {
    setSeoCategoryId(category._id);
    setSeoForm({
      name: category.name || "",
      slug: category.slug || "",
      slogan: category.slogan || "",
      seoTitle: category.seoTitle || "",
      seoDescription: category.seoDescription || "",
      seoKeywords: category.seoKeywords || "",
      seoFocusKeyword: category.seoFocusKeyword || "",
    });
    document.getElementById("category_seo_modal").showModal();
  };

  const handleSeoInputChange = (e) => {
    const { name, value } = e.target;
    setSeoForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSeo = async (e) => {
    e.preventDefault();
    if (!seoCategoryId) return;
    setSeoSaving(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/category/${seoCategoryId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            seoTitle: seoForm.seoTitle,
            seoDescription: seoForm.seoDescription,
            seoKeywords: seoForm.seoKeywords,
            seoFocusKeyword: seoForm.seoFocusKeyword,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to save category SEO");
      toast.success("Category SEO saved!");
      fetchCategories();
      document.getElementById("category_seo_modal").close();
      setSeoCategoryId(null);
      setSeoForm(emptySeoForm);
    } catch (error) {
      console.error("Error saving category SEO:", error);
      toast.error("Error saving category SEO. Please try again.");
    } finally {
      setSeoSaving(false);
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/category/${categoryId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete category");
      toast.success("Category deleted successfully!");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error deleting category. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      slogan: "",
      bannerImage: null,
      categoryThumbnail: null,
    });
    setPreview({
      bannerImage: null,
      categoryThumbnail: null,
    });
    setEditCategoryId(null);
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
    <div className="w-full">
      <ToastContainer />
      <div className="text-right">
        <button
          className="btn bg-orange-400"
          onClick={() => {
            resetForm();
            document.getElementById("category_modal").showModal();
          }}
        >
          Add Category
        </button>

        <dialog id="category_modal" className="modal">
          <div className="modal-box max-w-3xl">
            <form onSubmit={handleSubmit} className="text-black">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category Name</span>
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
              <div className="form-control">
                <label className="label">
                  <span className="label-text">URL Slug</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="e.g. living-room"
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-gray-500">
                    Used in URL: /category/{formData.slug || "your-slug"}
                  </span>
                </label>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category Slogan</span>
                </label>
                <input
                  type="text"
                  name="slogan"
                  value={formData.slogan}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Banner Image</span>
                </label>
                <input
                  type="file"
                  name="bannerImage"
                  onChange={handleInputChange}
                  className="input input-bordered"
                  // Note: required can be removed for the banner image
                />
                {preview.bannerImage && (
                  <img
                    src={preview.bannerImage}
                    alt="Banner Preview"
                    className="mt-4 rounded-lg w-full max-h-60 object-cover"
                  />
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category Thumbnail</span>
                </label>
                <input
                  type="file"
                  name="categoryThumbnail"
                  onChange={handleInputChange}
                  className="input input-bordered"
                  // Note: required can be removed for the thumbnail
                />
                {preview.categoryThumbnail && (
                  <img
                    src={preview.categoryThumbnail}
                    alt="Thumbnail Preview"
                    className="mt-4 rounded-lg w-full max-h-60 object-cover"
                  />
                )}
              </div>

              <div className="flex gap-4 mt-6">
                <button className="btn px-4 btn-primary" type="submit">
                  {editCategoryId ? "Update" : "Submit"}
                </button>
                <button
                  className="btn bg-red-600 text-white"
                  type="button"
                  onClick={() =>
                    document.getElementById("category_modal").close()
                  }
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </dialog>

        <dialog id="category_seo_modal" className="modal">
          <div className="modal-box max-w-3xl">
            <form onSubmit={handleSaveSeo} className="text-black space-y-4">
              <div>
                <h3 className="text-xl font-semibold">
                  Category SEO — {seoForm.name || "Category"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Optimizes the public page{" "}
                  <span className="font-mono">
                    /category/{seoForm.slug || "slug"}
                  </span>
                </p>
              </div>

              <ProductSeoFields
                formData={seoForm}
                onChange={handleSeoInputChange}
                onFieldUpdate={(name, value) =>
                  setSeoForm((prev) => ({ ...prev, [name]: value }))
                }
                generateEndpoint="/api/ai/category/generateSeo"
                nameMissingMessage="Category name is missing."
                buildPayload={(field) => ({
                  field,
                  categoryId: seoCategoryId,
                  name: seoForm.name,
                  slug: seoForm.slug,
                  slogan: seoForm.slogan,
                  seoFocusKeyword: seoForm.seoFocusKeyword,
                  seoTitle: seoForm.seoTitle,
                  seoDescription: seoForm.seoDescription,
                  seoKeywords: seoForm.seoKeywords,
                })}
              />

              <div className="flex gap-4 mt-2">
                <button
                  className="btn px-4 btn-primary"
                  type="submit"
                  disabled={seoSaving}
                >
                  {seoSaving ? "Saving..." : "Save SEO"}
                </button>
                <button
                  className="btn bg-red-600 text-white"
                  type="button"
                  onClick={() => {
                    document.getElementById("category_seo_modal").close();
                    setSeoCategoryId(null);
                    setSeoForm(emptySeoForm);
                  }}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </dialog>
      </div>

      <div className="overflow-x-auto mt-2">
        <table className="table border-collapse border border-gray-600">
          <thead>
            <tr className="text-black hover:text-black hover:bg-white">
              <th className="border border-gray-600 text-center">Sl. No.</th>
              <th className="border border-gray-600 text-center">
                Category Name
              </th>
              <th className="border border-gray-600 text-center">Slug</th>
              <th className="border border-gray-600 text-center">
                Category Slogan
              </th>
              <th className="border border-gray-600 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <tr
                key={category._id}
                className="hover:text-black hover:bg-white"
              >
                <td className="border border-gray-600 text-center">
                  {index + 1}
                </td>
                <td className="border border-gray-600 text-center">
                  {category.name}
                </td>
                <td className="border border-gray-600 text-center">
                  {category.slug || "—"}
                </td>
                <td className="border border-gray-600 text-center">
                  {category.slogan || "—"}
                </td>
                <td className="border-gray-600 border-b flex-col justify-center h-full">
                  <div className="flex justify-center items-center gap-2 flex-wrap py-2">
                    <FaRegEdit
                      className="cursor-pointer p-1 text-2xl rounded-md"
                      title="Edit"
                      onClick={() => handleEdit(category)}
                    />
                    <button
                      type="button"
                      className="btn btn-xs btn-outline"
                      onClick={() => handleOpenSeo(category)}
                    >
                      SEO
                    </button>
                    <RiDeleteBin6Line
                      className="cursor-pointer p-1 text-2xl rounded-md"
                      title="Delete"
                      onClick={() => handleDelete(category._id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategory;
