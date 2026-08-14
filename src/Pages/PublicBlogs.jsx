import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { stripHtml } from "../utils/slugify";
import { BACKEND_URL } from "@/config";

const PublicBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${BACKEND_URL}/api/blog/public`
        );
        if (!response.ok) throw new Error("Failed to fetch blogs");
        const data = await response.json();
        setBlogs(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 pt-40 md:pt-48 pb-12">
      <Helmet>
        <title>Blogs | Monorom</title>
      </Helmet>
      <h1 className="text-4xl font-bold mb-8">Blogs</h1>

      {loading ? (
        <p className="text-gray-500">Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <p className="text-gray-500">No blogs published yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => {
            const preview =
              blog.excerpt ||
              stripHtml(blog.content).slice(0, 140) ||
              "Read more";
            return (
              <Link
                key={blog._id}
                to={`/blogs/${blog.slug || blog._id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
              >
                {blog.coverImage ? (
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                    Monorom
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  <h2 className="text-xl font-semibold line-clamp-2">
                    {blog.title}
                  </h2>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-3 flex-1">
                    {preview}
                  </p>
                  <span className="text-gray-400 text-sm mt-4">
                    {blog.createdAt
                      ? new Date(blog.createdAt).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PublicBlogs;
