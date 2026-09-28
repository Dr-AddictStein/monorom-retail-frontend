import { useEffect, useState } from "react";
import SeoHead from "../Components/SeoHead";
import { contactSeo } from "../utils/seoDocument";
import { BACKEND_URL } from "@/config";

const PublicContact = () => {
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/siteData/getSiteData`);
        if (!response.ok) throw new Error("Failed to fetch contact details");
        setSite(await response.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSite();
  }, []);

  const seo = contactSeo(site || {});
  const email = site?.contactEmail?.trim() || "";
  const phone = site?.contactPhone?.trim() || "";
  const address = site?.contactAddress?.trim() || "";

  return (
    <div className="max-w-4xl mx-auto px-4 pt-40 md:pt-48 pb-12">
      <SeoHead
        title={seo.title}
        description={seo.description}
        path="/contact"
        robots={seo.robots}
      />
      <h1 className="text-4xl font-bold mb-8">Contact</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-4 text-lg text-gray-800">
          {address ? <p className="whitespace-pre-line">{address}</p> : null}
          {phone ? (
            <p>
              Phone: <a className="underline" href={`tel:${phone}`}>{phone}</a>
            </p>
          ) : null}
          {email ? (
            <p>
              Email: <a className="underline" href={`mailto:${email}`}>{email}</a>
            </p>
          ) : null}
          {!address && !phone && !email ? (
            <p className="text-gray-500">Contact details have not been added yet.</p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default PublicContact;
