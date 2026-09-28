import { useEffect, useState } from "react";
import SeoHead from "../Components/SeoHead";
import { RichTextContent } from "../Components/RichTextEditor";
import { CMS_PAGES } from "../utils/cmsPages";
import { cmsSeo } from "../utils/seoDocument";
import { BACKEND_URL } from "@/config";

const PublicCmsPage = ({ pageKey }) => {
  const page = CMS_PAGES[pageKey];
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${BACKEND_URL}/api/siteData/getSiteData`
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

  const seo = cmsSeo(pageKey, content);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-40 md:pt-48 pb-12">
      <SeoHead
        title={seo.title}
        description={seo.description}
        path={seo.path}
        robots={seo.robots}
      />
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
