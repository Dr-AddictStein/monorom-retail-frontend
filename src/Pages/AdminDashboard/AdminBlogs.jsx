import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminGate from "../../Components/AdminGate";
import { stripHtml } from "../../utils/slugify";

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/blog`
      );
      if (!response.ok) throw new Error("Failed to fetch blogs");
      const data = await response.json();
      setBlogs(data);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching blogs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (event, id) => {
    event.preventDefault();
    event.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/blog/${id}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete blog");
      setBlogs((prev) => prev.filter((blog) => blog._id !== id));
      toast.success("Blog deleted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error deleting blog. Please try again.");
    }
  };

  return (
    <AdminGate>
      <div className="p-2 md:p-4">
        <ToastContainer />
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <h3 className="text-3xl md:text-4xl font-semibold">Blogs</h3>
          <Link
            to="/dashboard/admin/blogs/new"
            className="bg-slate-700 text-white font-semibold px-5 py-2 rounded-md hover:bg-slate-800"
          >
            Add Blog
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading blogs...</p>
        ) : blogs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-10 text-center text-gray-500">
            No blogs yet. Click “Add Blog” to create the first one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {blogs.map((blog) => {
              const preview =
                blog.excerpt ||
                stripHtml(blog.content).slice(0, 140) ||
                "No preview available.";
              return (
                <Link
                  key={blog._id}
                  to={`/dashboard/admin/blogs/${blog._id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
                >
                  {blog.coverImage ? (
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="w-full h-44 object-cover"
                    />
                  ) : (
                    <div className="w-full h-44 bg-gray-200 flex items-center justify-center text-gray-500">
                      No cover image
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xl font-semibold line-clamp-2">
                        {blog.title}
                      </h4>
                      {!blog.published && (
                        <span className="shrink-0 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-3 flex-1">
                      {preview}
                    </p>
                    <div className="flex items-center justify-between mt-4 text-sm">
                      <span className="text-gray-400">
                        {blog.createdAt
                          ? new Date(blog.createdAt).toLocaleDateString()
                          : ""}
                      </span>
                      <button
                        type="button"
                        onClick={(event) => handleDelete(event, blog._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AdminGate>
  );
};

export default AdminBlogs;
