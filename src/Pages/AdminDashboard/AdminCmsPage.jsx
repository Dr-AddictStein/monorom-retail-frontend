import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminGate from "../../Components/AdminGate";
import RichTextEditor, { RichTextContent } from "../../Components/RichTextEditor";
import { CMS_PAGES } from "../../utils/cmsPages";

const AdminCmsPage = ({ pageKey }) => {
  const page = CMS_PAGES[pageKey];
  const [content, setContent] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/siteData/getSiteData`
      );
      if (!response.ok) throw new Error("Failed to fetch page content");
      const data = await response.json();
      const html = data?.[pageKey] || "";
      setContent(html);
      setDraft(html);
    } catch (error) {
      console.error(error);
      toast.error("Could not load page content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
    setEditing(false);
  }, [pageKey]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/siteData/updatePageContent`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageKey, content: draft }),
        }
      );
      if (!response.ok) throw new Error("Failed to save");
      setContent(draft);
      setEditing(false);
      toast.success(`${page.title} updated successfully!`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(content);
    setEditing(false);
  };

  return (
    <AdminGate>
      <div className="p-2 md:p-4">
        <ToastContainer />
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h3 className="text-3xl md:text-4xl font-semibold">{page.title}</h3>
          {!editing && !loading && (
            <button
              type="button"
              onClick={() => {
                setDraft(content);
                setEditing(true);
              }}
              className="bg-slate-700 text-white font-semibold px-5 py-2 rounded-md hover:bg-slate-800"
            >
              Edit
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : editing ? (
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <p className="text-sm text-gray-500 mb-3">
              Use the editor below to format text, add lists, links, images, and more.
            </p>
            <RichTextEditor
              key={pageKey}
              value={draft}
              onChange={setDraft}
              placeholder={`Write ${page.title.toLowerCase()} content...`}
              minHeight={420}
            />
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-emerald-700 text-white font-semibold px-6 py-2 rounded-md hover:bg-emerald-800 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="bg-gray-200 text-gray-800 font-semibold px-6 py-2 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-4 md:p-8">
            <RichTextContent html={content} emptyText={page.emptyText} />
          </div>
        )}
      </div>
    </AdminGate>
  );
};

export default AdminCmsPage;
