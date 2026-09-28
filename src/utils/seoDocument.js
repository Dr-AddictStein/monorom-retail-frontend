export const PRODUCTION_ORIGIN = "https://monoromstore.com";
export const SITE_NAME = "Monorom";

export const DEFAULT_HOME = {
  title: "Monorom | Ceramic Coffee Mugs in Bangladesh",
  description:
    "Shop ceramic coffee mugs from Monorom in Bangladesh. Browse marble, color, and printed mugs and order online.",
};

export const CMS_PAGES = {
  aboutUs: {
    path: "/about-us",
    title: "About us | Monorom",
    description:
      "Monorom is a ceramic homeware brand in Bangladesh. Read about our coffee mugs and how to order.",
  },
  termsOfUse: {
    path: "/terms-of-use",
    title: "Terms of use | Monorom",
    description: "Terms of use for shopping on the Monorom website.",
  },
  privacyPolicy: {
    path: "/privacy-policy",
    title: "Privacy policy | Monorom",
    description: "How Monorom collects, uses, and stores customer information.",
  },
  cookiePolicy: {
    path: "/cookie-policy",
    title: "Cookie policy | Monorom",
    description: "How Monorom uses cookies on monoromstore.com.",
  },
};

const PRIVATE_PATH = /^\/(login|signup|user|dashboard)(\/|$)/;

export function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function stripHtml(html) {
  return String(html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function isPlaceholderContent(html) {
  const text = stripHtml(html).toLowerCase();
  if (text.length < 80) return true;
  return /codechef|coding chef|lorem ipsum/.test(text);
}

export function hasContactDetails(site = {}) {
  return Boolean(
    clean(site.contactEmail) || clean(site.contactPhone) || clean(site.contactAddress)
  );
}

export function pageOrigin() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return window.location.origin;
    }
  }
  return PRODUCTION_ORIGIN;
}

export function absoluteUrl(path, origin = PRODUCTION_ORIGIN) {
  const base = String(origin || PRODUCTION_ORIGIN).replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function productPath(product) {
  return `/productDetails/${product?.slug || product?._id || ""}`;
}

export function categoryPath(category) {
  return `/category/${category?.slug || category?._id || ""}`;
}

export function sellingPrice(product) {
  if (product?.price != null && product.price !== "") return Number(product.price);
  if (product?.priceFC != null) return Number(product.priceFC);
  if (product?.priceSC != null) return Number(product.priceSC);
  if (product?.priceMC != null) return Number(product.priceMC);
  if (product?.priceBC != null) return Number(product.priceBC);
  return 0;
}

export function homeSeo(site = {}) {
  return {
    title: clean(site.seoTitle) || DEFAULT_HOME.title,
    description: clean(site.seoDescription) || DEFAULT_HOME.description,
    image: site.homeBanner || site.logo || "",
  };
}

export function productSeo(product = {}) {
  if (!product?.name && !product?.seoTitle) {
    return {
      title: `${SITE_NAME}`,
      description: DEFAULT_HOME.description,
      image: "",
    };
  }
  const name = clean(product.name) || "Product";
  const plain = stripHtml(product.desc);
  return {
    title: clean(product.seoTitle) || `${name} | ${SITE_NAME}`,
    description:
      clean(product.seoDescription) ||
      (plain ? plain.slice(0, 160) : "") ||
      `Buy ${name} from Monorom. Ceramic coffee mugs in Bangladesh.`,
    image: product.productThumbnail || product.bannerImage || "",
  };
}

export function categorySeo(category = {}) {
  if (!category?.name && !category?.seoTitle) {
    return {
      title: SITE_NAME,
      description: DEFAULT_HOME.description,
      image: "",
    };
  }
  const name = clean(category.name) || "Category";
  return {
    title: clean(category.seoTitle) || `${name} | ${SITE_NAME}`,
    description:
      clean(category.seoDescription) ||
      clean(category.slogan) ||
      `Shop ${name} from Monorom. Ceramic coffee mugs in Bangladesh.`,
    image: category.bannerImage || category.categoryThumbnail || "",
  };
}

export function cmsSeo(pageKey, html = "") {
  const page = CMS_PAGES[pageKey];
  const placeholder = isPlaceholderContent(html);
  const plain = stripHtml(html);
  return {
    title: page.title,
    description: placeholder ? page.description : plain.slice(0, 160) || page.description,
    robots: placeholder ? "noindex, follow" : "index, follow",
    path: page.path,
    indexable: !placeholder,
  };
}

export function blogSeo(blog) {
  if (!blog?.title) {
    return {
      title: `Blog | ${SITE_NAME}`,
      description: "Stories and guides from Monorom about ceramic coffee mugs.",
      image: "",
      robots: "index, follow",
      indexable: false,
    };
  }
  const plain = clean(blog.excerpt) || stripHtml(blog.content);
  const placeholder = isPlaceholderContent(blog.content);
  return {
    title: `${clean(blog.title)} | ${SITE_NAME}`,
    description: placeholder
      ? "Stories and guides from Monorom about ceramic coffee mugs."
      : plain.slice(0, 160),
    image: blog.coverImage || "",
    robots: placeholder ? "noindex, follow" : "index, follow",
    indexable: !placeholder && blog.published !== false,
  };
}

export function contactSeo(site = {}) {
  const indexable = hasContactDetails(site);
  return {
    title: `Contact | ${SITE_NAME}`,
    description: indexable
      ? "Contact Monorom for ceramic coffee mug orders, delivery, and product questions in Bangladesh."
      : "Contact details for Monorom will be published here.",
    robots: indexable ? "index, follow" : "noindex, follow",
    indexable,
  };
}

export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function itemListJsonLd(name, items, origin, pathFor) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.slice(0, 50).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: clean(item.name || item.title),
      url: absoluteUrl(pathFor(item), origin),
    })),
  };
}

export function organizationGraph(site = {}, origin = PRODUCTION_ORIGIN) {
  const org = {
    "@type": "Organization",
    name: SITE_NAME,
    url: origin,
  };
  if (clean(site.logo)) org.logo = site.logo;
  if (clean(site.contactEmail)) org.email = clean(site.contactEmail);
  if (clean(site.contactPhone)) org.telephone = clean(site.contactPhone);
  if (clean(site.contactAddress)) {
    org.address = {
      "@type": "PostalAddress",
      streetAddress: clean(site.contactAddress),
      addressCountry: "BD",
    };
  }
  return {
    "@context": "https://schema.org",
    "@graph": [
      org,
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: origin,
      },
    ],
  };
}

export function productJsonLd({ product, category, url }) {
  const seo = productSeo(product);
  const price = sellingPrice(product);
  const images = [seo.image, ...(product.galleryImages || [])].filter(Boolean);
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: clean(product.name),
    description: seo.description,
    url,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "BDT",
      price: Number.isFinite(price) ? price.toFixed(2) : "0.00",
      availability:
        Number(product.stock) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };
  if (images.length) data.image = images;
  if (clean(product.productCode)) data.sku = clean(product.productCode);
  if (clean(category?.name)) data.category = clean(category.name);
  return data;
}

export function articleJsonLd(blog, url) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: clean(blog.title),
    description: blogSeo(blog).description,
    image: blog.coverImage || undefined,
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt || blog.createdAt,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: url,
  };
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function jsonLdScripts(jsonLd) {
  const blocks = (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean);
  return blocks
    .map(
      (block) =>
        `<script type="application/ld+json">${JSON.stringify(block).replace(/</g, "\\u003c")}</script>`
    )
    .join("\n");
}

export function renderMetaBlock({
  title,
  description,
  canonical,
  image,
  ogType = "website",
  robots = "index, follow",
  jsonLd = [],
}) {
  const tags = [
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta name="robots" content="${escapeHtml(robots)}" />`,
    `<meta property="og:locale" content="en_BD" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:type" content="${escapeHtml(ogType)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : "",
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : "",
    jsonLdScripts(jsonLd),
  ];
  return tags.filter(Boolean).join("\n");
}

export function injectSeoHtml(html, meta) {
  let next = String(html);
  if (meta.title) {
    if (/<title>[\s\S]*?<\/title>/i.test(next)) {
      next = next.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
    } else {
      next = next.replace(/<head>/i, `<head>\n<title>${escapeHtml(meta.title)}</title>`);
    }
  }
  next = next.replace(/<meta\s+name=["']description["'][^>]*>/gi, "");
  next = next.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "");
  next = next.replace(/<\/head>/i, `${renderMetaBlock(meta)}\n</head>`);
  if (meta.bodyHtml) {
    next = next.replace(
      /<div id="root">\s*<\/div>/i,
      `<div id="root"><main id="seo-snapshot">${meta.bodyHtml}</main></div>`
    );
  }
  return next;
}

function linkList(items, origin, pathFor) {
  return `<ul>${items
    .slice(0, 100)
    .map((item) => {
      const href = absoluteUrl(pathFor(item), origin);
      const label = clean(item.name || item.title);
      return `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`;
    })
    .join("")}</ul>`;
}

export function homeBody(site, categories, origin) {
  const heading = clean(site?.homeSlogan) || "Ceramic coffee mugs in Bangladesh";
  const intro = clean(site?.homeSmallText) || DEFAULT_HOME.description;
  const sections = (categories || [])
    .map((category) => {
      const href = absoluteUrl(categoryPath(category), origin);
      const products = linkList(category.productsData || [], origin, productPath);
      return `<section><h2><a href="${escapeHtml(href)}">${escapeHtml(clean(category.name))}</a></h2>${products}</section>`;
    })
    .join("");
  return `<h1>${escapeHtml(heading)}</h1><p>${escapeHtml(intro)}</p>${sections}`;
}

export function categoryBody(category, products, origin) {
  const name = clean(category?.name) || "Category";
  const intro = clean(category?.slogan) || categorySeo(category).description;
  return `<nav><a href="${escapeHtml(absoluteUrl("/", origin))}">Home</a> / <span>${escapeHtml(name)}</span></nav><h1>${escapeHtml(name)}</h1><p>${escapeHtml(intro)}</p>${linkList(products || [], origin, productPath)}`;
}

export function productBody(product, category, origin) {
  const name = clean(product?.name) || "Product";
  const categoryName = clean(category?.name) || "Category";
  const categoryHref = category
    ? absoluteUrl(categoryPath(category), origin)
    : absoluteUrl("/", origin);
  const plain = stripHtml(product?.desc).slice(0, 500);
  const lines = Array.isArray(product?.specialLines)
    ? product.specialLines.filter(Boolean)
    : [];
  const specs = lines.length
    ? `<ul>${lines.map((line) => `<li>${escapeHtml(clean(line))}</li>`).join("")}</ul>`
    : "";
  const image = product?.productThumbnail
    ? `<img src="${escapeHtml(product.productThumbnail)}" alt="${escapeHtml(name)}" />`
    : "";
  const price = sellingPrice(product);
  return `<nav><a href="${escapeHtml(absoluteUrl("/", origin))}">Home</a> / <a href="${escapeHtml(categoryHref)}">${escapeHtml(categoryName)}</a> / <span>${escapeHtml(name)}</span></nav><h1>${escapeHtml(name)}</h1>${image}<p>${escapeHtml(plain || productSeo(product).description)}</p>${specs}<p>Tk. ${escapeHtml(String(price))}</p>`;
}

export function allProductsBody(products, origin) {
  return `<h1>All coffee mugs</h1><p>Browse every ceramic coffee mug from Monorom.</p>${linkList(products || [], origin, productPath)}`;
}

export function blogsBody(blogs, origin) {
  return `<h1>Blogs</h1><p>Guides and stories from Monorom.</p>${linkList(blogs || [], origin, (blog) => `/blogs/${blog.slug || blog._id}`)}`;
}

export function blogBody(blog, origin) {
  const plain = (clean(blog.excerpt) || stripHtml(blog.content)).slice(0, 800);
  const image = blog.coverImage
    ? `<img src="${escapeHtml(blog.coverImage)}" alt="${escapeHtml(clean(blog.title))}" />`
    : "";
  return `<nav><a href="${escapeHtml(absoluteUrl("/blogs", origin))}">Blogs</a></nav><h1>${escapeHtml(clean(blog.title))}</h1>${image}<p>${escapeHtml(plain)}</p>`;
}

export function cmsBody(pageKey, html) {
  const page = CMS_PAGES[pageKey];
  const plain = stripHtml(html).slice(0, 1500);
  return `<h1>${escapeHtml(page.title.replace(` | ${SITE_NAME}`, ""))}</h1><p>${escapeHtml(plain || page.description)}</p>`;
}

export function contactBody(site = {}) {
  const email = clean(site.contactEmail);
  const phone = clean(site.contactPhone);
  const address = clean(site.contactAddress);
  const parts = ["<h1>Contact Monorom</h1>"];
  if (address) parts.push(`<p>${escapeHtml(address)}</p>`);
  if (phone) parts.push(`<p>Phone: ${escapeHtml(phone)}</p>`);
  if (email) parts.push(`<p>Email: ${escapeHtml(email)}</p>`);
  if (!address && !phone && !email) {
    parts.push("<p>Contact details have not been added yet.</p>");
  }
  return parts.join("");
}

export function normalizePath(pathname) {
  if (!pathname) return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

export function matchSeoPath(pathname) {
  const path = normalizePath(pathname);
  if (path === "/") return { type: "home", path };
  if (path === "/allProducts") return { type: "allProducts", path };
  if (path === "/blogs") return { type: "blogs", path };
  if (path === "/contact") return { type: "contact", path };
  if (path === "/sitemap.xml") return { type: "sitemap", path };
  if (CMS_PAGES && Object.values(CMS_PAGES).some((page) => page.path === path)) {
    const pageKey = Object.keys(CMS_PAGES).find((key) => CMS_PAGES[key].path === path);
    return { type: "cms", path, pageKey };
  }
  const category = path.match(/^\/category\/([^/]+)$/);
  if (category) return { type: "category", path, slug: decodeURIComponent(category[1]) };
  const product = path.match(/^\/productDetails\/([^/]+)$/);
  if (product) return { type: "product", path, slug: decodeURIComponent(product[1]) };
  const blog = path.match(/^\/blogs\/([^/]+)$/);
  if (blog) return { type: "blog", path, slug: decodeURIComponent(blog[1]) };
  if (PRIVATE_PATH.test(path)) return { type: "private", path };
  return null;
}

export function lastmod(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildSitemapXml(entries) {
  const urls = entries
    .map((entry) => {
      const modified = entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : "";
      return `  <url><loc>${escapeXml(entry.loc)}</loc>${modified}</url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export const BOT_USER_AGENT =
  /googlebot|google-inspectiontool|storebot-google|adsbot-google|mediapartners-google|bingbot|duckduckbot|baiduspider|yandexbot|slurp|facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|pinterestbot|pinterest|applebot|embedly|quora link preview|redditbot|ia_archiver|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|bytespider|gptbot|chatgpt-user|claudebot|perplexitybot|chrome-lighthouse/i;

export function isSearchBot(userAgent) {
  return BOT_USER_AGENT.test(String(userAgent || ""));
}
