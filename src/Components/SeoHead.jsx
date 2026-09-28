/* eslint-disable react/prop-types -- this project does not use PropTypes */
import { Helmet } from "react-helmet-async";
import { absoluteUrl, pageOrigin } from "../utils/seoDocument";

/**
 * Client-rendered tags. These match the HTML injected for crawlers.
 */
const SeoHead = ({
  title,
  description,
  path = "/",
  image = "",
  ogType = "website",
  robots = "index, follow",
  jsonLd = [],
}) => {
  const canonical = absoluteUrl(path, pageOrigin());
  const blocks = (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description || ""} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={robots} />
      <meta property="og:locale" content="en_BD" />
      <meta property="og:site_name" content="Monorom" />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description || ""} />
      <meta property="og:url" content={canonical} />
      {image ? <meta property="og:image" content={image} /> : null}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description || ""} />
      {image ? <meta name="twitter:image" content={image} /> : null}
      {blocks.map((block, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
};

export default SeoHead;
