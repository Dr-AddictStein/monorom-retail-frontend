import React, { useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../../hooks/useAuthContext";
import { Link } from "react-router-dom";

const AdminCategory = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    slogan: "",
    bannerImage: null,
    categoryThumbnail: null,
  });
  const [preview, setPreview] = useState({
    bannerImage: null,
    categoryThumbnail: null,
  });
  const [editCategoryId, setEditCategoryId] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
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

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      setPreview({ ...preview, [name]: URL.createObjectURL(file) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
        `${import.meta.env.VITE_BACKEND_URL}/api/category/`,
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
        `${import.meta.env.VITE_BACKEND_URL}/api/category/${categoryId}`,
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

  const handleDelete = async (categoryId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/category/${categoryId}`,
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
      </div>

      <div className="overflow-x-auto mt-2">
        <table className="table border-collapse border border-gray-600">
          <thead>
            <tr className="text-black hover:text-black hover:bg-white">
              <th className="border border-gray-600 text-center">Sl. No.</th>
              <th className="border border-gray-600 text-center">
                Category Name
              </th>
              <th className="border border-gray-600 text-center">
                SubCategories
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
                  <ul className="list-disc list-inside">
                    {category.subCategories.map(
                      (subCategoryId, subCategoryIndex) => {
                        const subCategory = subCategories.find(
                          (sub) => sub._id === subCategoryId
                        );
                        return (
                          <li key={subCategoryIndex} className="my-4">
                            {subCategory
                              ? subCategory.name
                              : "Unknown Subcategory"}
                          </li>
                        );
                      }
                    )}
                  </ul>
                </td>
                <td className="border-gray-600 border-b flex-col justify-center h-full">
                  <div className="flex justify-center gap-2">
                    <FaRegEdit
                      className="cursor-pointer p-1 text-2xl rounded-md"
                      onClick={() => handleEdit(category)}
                    />
                    <RiDeleteBin6Line
                      className="cursor-pointer p-1 text-2xl rounded-md"
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
