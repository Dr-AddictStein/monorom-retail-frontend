import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { RichTextContent } from "../Components/RichTextEditor";
import { CMS_PAGES } from "../utils/cmsPages";

const PublicCmsPage = ({ pageKey }) => {
  const page = CMS_PAGES[pageKey];
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/siteData/getSiteData`
        );
        if (!response.ok) throw new Error("Failed to fetch page");
        const data = await response.json();
        setContent(data?.[pageKey] || "");
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [pageKey]);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-40 md:pt-48 pb-12">
      <Helmet>
        <title>{page.title} | Monorom</title>
      </Helmet>
      <h1 className="text-4xl font-bold mb-8">{page.title}</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <RichTextContent html={content} emptyText={page.emptyText} />
      )}
    </div>
  );
};

export default PublicCmsPage;
