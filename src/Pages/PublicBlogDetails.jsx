import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { RichTextContent } from "../Components/RichTextEditor";
import { stripHtml } from "../utils/slugify";

const PublicBlogDetails = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/blog/${slug}`
        );
        if (!response.ok) {
          setNotFound(true);
          setBlog(null);
          return;
        }
        const data = await response.json();
        if (data.published === false) {
          setNotFound(true);
          setBlog(null);
          return;
        }
        setBlog(data);
      } catch (error) {
        console.error(error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const metaDescription = blog
    ? blog.excerpt || stripHtml(blog.content).slice(0, 160)
    : "";

  return (
    <div className="max-w-4xl mx-auto px-4 pt-40 md:pt-48 pb-12">
      <Helmet>
        <title>{blog ? `${blog.title} | Monorom` : "Blog | Monorom"}</title>
        {metaDescription ? (
          <meta name="description" content={metaDescription} />
        ) : null}
      </Helmet>

      <Link to="/blogs" className="text-slate-700 hover:underline inline-block mb-6">
        ← All blogs
      </Link>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : notFound || !blog ? (
        <p className="text-gray-500">This blog could not be found.</p>
      ) : (
        <article>
          {blog.coverImage ? (
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full max-h-[420px] object-cover rounded-lg mb-6"
            />
          ) : null}
          <h1 className="text-4xl font-bold mb-3">{blog.title}</h1>
          <p className="text-gray-400 text-sm mb-8">
            {blog.createdAt
              ? new Date(blog.createdAt).toLocaleDateString()
              : ""}
          </p>
          <RichTextContent
            html={blog.content}
            emptyText="This blog has no content yet."
          />
        </article>
      )}
    </div>
  );
};

export default PublicBlogDetails;
