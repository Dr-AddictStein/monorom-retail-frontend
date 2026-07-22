import React, { useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../../hooks/useAuthContext";

const AdminSubCategory = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    slogan: "",
    bannerImage: null,
    subCategoryThumbnail: null,
    category: "",
  });
  const [preview, setPreview] = useState({
    bannerImage: null,
    subCategoryThumbnail: null,
  });
  const [editSubCategoryId, setEditSubCategoryId] = useState(null);

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, []);

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
    let bannerImagePath = formData.bannerImage
      ? await uploadFile(formData.bannerImage)
      : "";
    let thumbnailPath = formData.subCategoryThumbnail
      ? await uploadFile(formData.subCategoryThumbnail)
      : "";

    const subCategoryData = {
      name: formData.name,
      slogan: formData.slogan,
      bannerImage: bannerImagePath || preview.bannerImage, // Use existing image if not uploading new
      subCategoryThumbnail: thumbnailPath || preview.subCategoryThumbnail, // Use existing thumbnail if not uploading new
      category: formData.category,
    };

    if (editSubCategoryId) {
      await updateSubCategory(editSubCategoryId, subCategoryData);
    } else {
      await createSubCategory(subCategoryData);
    }

    resetForm(); // Reset form data and previews
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slogan: "",
      bannerImage: null,
      subCategoryThumbnail: null,
      category: "",
    });
    setPreview({
      bannerImage: null,
      subCategoryThumbnail: null,
    });
    setEditSubCategoryId(null);
  };

  const createSubCategory = async (data) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/subcategory/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error("Failed to add subcategory");
      toast.success("SubCategory added successfully!");
      fetchSubCategories();
      document.getElementById("subcategory_modal").close();
    } catch (error) {
      console.error("Error adding subcategory:", error);
      toast.error("Error adding subcategory. Please try again.");
    }
  };

  const updateSubCategory = async (subCategoryId, data) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/subcategory/${subCategoryId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error("Failed to update subcategory");
      toast.success("SubCategory updated successfully!");
      fetchSubCategories();
      document.getElementById("subcategory_modal").close();
    } catch (error) {
      console.error("Error updating subcategory:", error);
      toast.error("Error updating subcategory. Please try again.");
    }
  };

  const handleEdit = (subCategory) => {
    setEditSubCategoryId(subCategory._id);
    setFormData({
      name: subCategory.name,
      slogan: subCategory?.slogan,
      bannerImage: null, // Keep existing image URL
      subCategoryThumbnail: null, // Keep existing thumbnail URL
      category: subCategory.category,
    });
    setPreview({
      bannerImage: subCategory.bannerImage,
      subCategoryThumbnail: subCategory.subCategoryThumbnail,
    });
    document.getElementById("subcategory_modal").showModal();
  };

  const handleDelete = async (subCategoryId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/subcategory/${subCategoryId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete subcategory");
      toast.success("SubCategory deleted successfully!");
      fetchSubCategories();
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      toast.error("Error deleting subcategory. Please try again.");
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
    <div className="w-full">
      <ToastContainer />
      <div className="text-right">
        <button
          className="btn bg-orange-400"
          onClick={() => {
            resetForm(); // Reset form when adding new subcategory
            document.getElementById("subcategory_modal").showModal();
          }}
        >
          Add SubCategory
        </button>

        <dialog id="subcategory_modal" className="modal">
          <div className="modal-box max-w-3xl">
            <form onSubmit={handleSubmit} className="text-black">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">SubCategory Name</span>
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
                  <span className="label-text">SubCategory Slogan</span>
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

              <div className="form-control">
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
                    className="mt-4 rounded-lg w-full max-h-60 object-cover"
                  />
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">SubCategory Thumbnail</span>
                </label>
                <input
                  type="file"
                  name="subCategoryThumbnail"
                  onChange={handleInputChange}
                  className="input input-bordered"
                />
                {preview.subCategoryThumbnail && (
                  <img
                    src={preview.subCategoryThumbnail}
                    alt="Thumbnail Preview"
                    className="mt-4 rounded-lg w-full max-h-60 object-cover"
                  />
                )}
              </div>

              <div className="flex gap-4 mt-6">
                <button className="btn px-4 btn-primary" type="submit">
                  {editSubCategoryId ? "Update" : "Submit"}
                </button>
                <button
                  className="btn bg-red-600 text-white"
                  type="button"
                  onClick={() =>
                    document.getElementById("subcategory_modal").close()
                  }
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </dialog>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th className="border border-gray-600">#</th>
              <th className="border border-gray-600">Name</th>
              <th className="border border-gray-600">Category</th>
              <th className="border border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subCategories.map((subCategory, index) => (
              <tr key={subCategory._id} className="hover:bg-gray-100">
                <td className="border border-gray-600">{index + 1}</td>
                <td className="border border-gray-600">{subCategory.name}</td>
                <td className="border border-gray-600">
                  {categories.find((cat) => cat._id === subCategory.category)
                    ?.name || "N/A"}
                </td>
                <td className="border-gray-600 border-b border-r flex-col justify-center h-full">
                  <div className="flex justify-center gap-2">
                    <FaRegEdit
                      className="cursor-pointer p-1 text-2xl rounded-md"
                      onClick={() => handleEdit(subCategory)}
                    />
                    <RiDeleteBin6Line
                      className="cursor-pointer p-1 text-2xl rounded-md"
                      onClick={() => handleDelete(subCategory._id)}
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

export default AdminSubCategory;
