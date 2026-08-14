import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminGate from "../../Components/AdminGate";
import { RichTextContent } from "../../Components/RichTextEditor";

const AdminBlogView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/blog/${id}`
        );
        if (!response.ok) throw new Error("Failed to fetch blog");
        const data = await response.json();
        setBlog(data);
      } catch (error) {
        console.error(error);
        toast.error("Could not load this blog.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/blog/${id}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete blog");
      toast.success("Blog deleted.");
      navigate("/dashboard/admin/blogs");
    } catch (error) {
      console.error(error);
      toast.error("Error deleting blog.");
    }
  };

  return (
    <AdminGate>
      <div className="p-2 md:p-4">
        <ToastContainer />
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            to="/dashboard/admin/blogs"
            className="text-slate-700 hover:underline"
          >
            ← All blogs
          </Link>
          {blog && (
            <div className="flex gap-3">
              <Link
                to={`/dashboard/admin/blogs/${id}/edit`}
                className="bg-slate-700 text-white font-semibold px-5 py-2 rounded-md hover:bg-slate-800"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-600 text-white font-semibold px-5 py-2 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : !blog ? (
          <p className="text-gray-500">Blog not found.</p>
        ) : (
          <article className="bg-white rounded-lg shadow overflow-hidden">
            {blog.coverImage ? (
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full max-h-[360px] object-cover"
              />
            ) : null}
            <div className="p-4 md:p-8">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className="text-3xl md:text-4xl font-semibold">
                  {blog.title}
                </h3>
                {!blog.published && (
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                    Draft
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm mb-6">
                {blog.createdAt
                  ? new Date(blog.createdAt).toLocaleDateString()
                  : ""}
              </p>
              <RichTextContent
                html={blog.content}
                emptyText="This blog has no content yet."
              />
            </div>
          </article>
        )}
      </div>
    </AdminGate>
  );
};

export default AdminBlogView;
