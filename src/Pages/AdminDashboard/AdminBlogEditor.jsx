import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminGate from "../../Components/AdminGate";
import RichTextEditor from "../../Components/RichTextEditor";
import { toSlug } from "../../utils/slugify";
import { uploadFile } from "../../utils/uploadFile";
import { BACKEND_URL } from "@/config";

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  coverImage: "",
  content: "",
  published: true,
};

const AdminBlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${BACKEND_URL}/api/blog/${id}`
        );
        if (!response.ok) throw new Error("Failed to fetch blog");
        const data = await response.json();
        setFormData({
          title: data.title || "",
          slug: data.slug || "",
          excerpt: data.excerpt || "",
          coverImage: data.coverImage || "",
          content: data.content || "",
          published: data.published !== false,
        });
        setSlugTouched(Boolean(data.slug));
      } catch (error) {
        console.error(error);
        toast.error("Could not load this blog.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, isEdit]);

  const handleTitleChange = (title) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: slugTouched ? prev.slug : toSlug(title),
    }));
  };

  const handleCoverUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const filePath = await uploadFile(file);
      setFormData((prev) => ({ ...prev, coverImage: filePath }));
      toast.success("Cover image uploaded.");
    } catch (error) {
      console.error(error);
      toast.error("Cover image upload failed.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required.");
      return;
    }

    try {
      setSaving(true);
      const url = isEdit
        ? `${BACKEND_URL}/api/blog/${id}`
        : `${BACKEND_URL}/api/blog`;
      const response = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || "Failed to save blog");
      }
      const saved = await response.json();
      toast.success(isEdit ? "Blog updated!" : "Blog created!");
      navigate(`/dashboard/admin/blogs/${saved._id}`);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save blog.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminGate>
      <div className="p-2 md:p-4">
        <ToastContainer />
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h3 className="text-3xl md:text-4xl font-semibold">
            {isEdit ? "Edit Blog" : "Add Blog"}
          </h3>
          <Link
            to={isEdit ? `/dashboard/admin/blogs/${id}` : "/dashboard/admin/blogs"}
            className="text-slate-700 hover:underline"
          >
            Cancel
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow p-4 md:p-6 space-y-5"
          >
            <div>
              <label className="block font-semibold mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full p-2 border rounded text-gray-700"
                placeholder="Blog title"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setFormData((prev) => ({ ...prev, slug: e.target.value }));
                }}
                className="w-full p-2 border rounded text-gray-700"
                placeholder="blog-url-slug"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Short excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                }
                className="w-full p-2 border rounded text-gray-700"
                rows={3}
                placeholder="Optional short summary shown on cards"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Cover image</label>
              {formData.coverImage ? (
                <img
                  src={formData.coverImage}
                  alt="Cover preview"
                  className="w-full max-h-56 object-cover rounded mb-3"
                />
              ) : null}
              <input type="file" accept="image/*" onChange={handleCoverUpload} />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    published: e.target.checked,
                  }))
                }
              />
              <span>Published (visible on the public site)</span>
            </label>

            <div>
              <label className="block font-semibold mb-2">Content</label>
              <p className="text-sm text-gray-500 mb-2">
                Format headings, lists, colors, links, and upload images from the toolbar.
              </p>
              {!loading && (
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) =>
                    setFormData((prev) => ({ ...prev, content }))
                  }
                  placeholder="Write the blog article..."
                  minHeight={420}
                />
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-700 text-white font-semibold px-6 py-2 rounded-md hover:bg-emerald-800 disabled:opacity-60"
            >
              {saving ? "Saving..." : isEdit ? "Save changes" : "Create blog"}
            </button>
          </form>
        )}
      </div>
    </AdminGate>
  );
};

export default AdminBlogEditor;
