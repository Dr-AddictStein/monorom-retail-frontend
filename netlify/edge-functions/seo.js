import {
  CMS_PAGES,
  PRODUCTION_ORIGIN,
  absoluteUrl,
  allProductsBody,
  articleJsonLd,
  blogBody,
  blogSeo,
  blogsBody,
  breadcrumbJsonLd,
  buildSitemapXml,
  categoryBody,
  categoryPath,
  categorySeo,
  clean,
  cmsBody,
  cmsSeo,
  contactBody,
  contactSeo,
  homeBody,
  homeSeo,
  injectSeoHtml,
  isSearchBot,
  itemListJsonLd,
  lastmod,
  matchSeoPath,
  organizationGraph,
  productBody,
  productJsonLd,
  productPath,
  productSeo,
} from "../../src/utils/seoDocument.js";

const API_ORIGIN = "https://api.monoromstore.com";

const ALTERNATE_HOSTS = new Set([
  "deliymug.com",
  "www.deliymug.com",
  "www.monoromstore.com",
]);

async function getJson(path) {
  try {
    const response = await fetch(`${API_ORIGIN}${path}`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function isEntity(data) {
  return Boolean(data && typeof data === "object" && !Array.isArray(data) && data._id);
}

async function buildPage(route) {
  const origin = PRODUCTION_ORIGIN;

  if (route.type === "private") {
    return {
      title: "Monorom",
      description: "Monorom account",
      canonical: absoluteUrl(route.path, origin),
      robots: "noindex, nofollow",
      jsonLd: [],
    };
  }

  if (route.type === "home") {
    const [site, categories] = await Promise.all([
      getJson("/api/siteData/getSiteData"),
      getJson("/api/category/homePageData"),
    ]);
    const seo = homeSeo(site || {});
    const list = Array.isArray(categories) ? categories : [];
    return {
      title: seo.title,
      description: seo.description,
      canonical: absoluteUrl("/", origin),
      image: seo.image,
      robots: "index, follow",
      jsonLd: [organizationGraph(site || {}, origin)],
      bodyHtml: homeBody(site || {}, list, origin),
    };
  }

  if (route.type === "allProducts") {
    const products = await getJson("/api/product");
    const list = Array.isArray(products) ? products : [];
    return {
      title: "All coffee mugs | Monorom",
      description:
        "Browse every ceramic coffee mug from Monorom. Compare designs and order online in Bangladesh.",
      canonical: absoluteUrl("/allProducts", origin),
      robots: "index, follow",
      jsonLd: list.length
        ? [itemListJsonLd("All Monorom coffee mugs", list, origin, productPath)]
        : [],
      bodyHtml: allProductsBody(list, origin),
    };
  }

  if (route.type === "category") {
    const category = await getJson(`/api/category/${encodeURIComponent(route.slug)}`);
    if (!isEntity(category)) {
      return notFound(route.path);
    }
    const products = await getJson(
      `/api/product/getProductsByCategoryId/${category._id}`
    );
    const list = Array.isArray(products) ? products : [];
    const seo = categorySeo(category);
    const url = absoluteUrl(categoryPath(category), origin);
    return {
      title: seo.title,
      description: seo.description,
      canonical: url,
      image: seo.image,
      robots: "index, follow",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: seo.title,
          description: seo.description,
          url,
          isPartOf: { "@type": "WebSite", name: "Monorom", url: origin },
        },
        breadcrumbJsonLd([
          { name: "Home", url: absoluteUrl("/", origin) },
          { name: clean(category.name), url },
        ]),
        list.length ? itemListJsonLd(category.name, list, origin, productPath) : null,
      ],
      bodyHtml: categoryBody(category, list, origin),
    };
  }

  if (route.type === "product") {
    const product = await getJson(`/api/product/${encodeURIComponent(route.slug)}`);
    if (!isEntity(product)) return notFound(route.path);
    const category = product.category
      ? await getJson(`/api/category/${product.category}`)
      : null;
    const seo = productSeo(product);
    const url = absoluteUrl(productPath(product), origin);
    const crumbs = [{ name: "Home", url: absoluteUrl("/", origin) }];
    if (isEntity(category)) {
      crumbs.push({
        name: clean(category.name),
        url: absoluteUrl(categoryPath(category), origin),
      });
    }
    crumbs.push({ name: clean(product.name), url });
    return {
      title: seo.title,
      description: seo.description,
      canonical: url,
      image: seo.image,
      ogType: "product",
      robots: "index, follow",
      jsonLd: [
        productJsonLd({ product, category: isEntity(category) ? category : null, url }),
        breadcrumbJsonLd(crumbs),
      ],
      bodyHtml: productBody(product, isEntity(category) ? category : null, origin),
    };
  }

  if (route.type === "blogs") {
    const blogs = await getJson("/api/blog/public");
    const list = (Array.isArray(blogs) ? blogs : []).filter((blog) => blogSeo(blog).indexable);
    return {
      title: "Blogs | Monorom",
      description: "Guides and stories from Monorom about ceramic coffee mugs in Bangladesh.",
      canonical: absoluteUrl("/blogs", origin),
      robots: "index, follow",
      jsonLd: list.length
        ? [
            itemListJsonLd(
              "Monorom blog",
              list.map((blog) => ({ ...blog, name: blog.title })),
              origin,
              (blog) => `/blogs/${blog.slug || blog._id}`
            ),
          ]
        : [],
      bodyHtml: blogsBody(list, origin),
    };
  }

  if (route.type === "blog") {
    const blog = await getJson(`/api/blog/${encodeURIComponent(route.slug)}`);
    if (!isEntity(blog) || blog.published === false) return notFound(route.path);
    const seo = blogSeo(blog);
    const url = absoluteUrl(`/blogs/${blog.slug || route.slug}`, origin);
    return {
      title: seo.title,
      description: seo.description,
      canonical: url,
      image: seo.image,
      ogType: "article",
      robots: seo.robots,
      jsonLd: seo.indexable ? [articleJsonLd(blog, url)] : [],
      bodyHtml: blogBody(blog, origin),
    };
  }

  if (route.type === "cms") {
    const site = await getJson("/api/siteData/getSiteData");
    const seo = cmsSeo(route.pageKey, site?.[route.pageKey] || "");
    return {
      title: seo.title,
      description: seo.description,
      canonical: absoluteUrl(seo.path, origin),
      robots: seo.robots,
      jsonLd: [],
      bodyHtml: cmsBody(route.pageKey, site?.[route.pageKey] || ""),
    };
  }

  if (route.type === "contact") {
    const site = await getJson("/api/siteData/getSiteData");
    const seo = contactSeo(site || {});
    return {
      title: seo.title,
      description: seo.description,
      canonical: absoluteUrl("/contact", origin),
      robots: seo.robots,
      jsonLd: [],
      bodyHtml: contactBody(site || {}),
    };
  }

  return null;
}

function notFound(path) {
  return {
    title: "Page not found | Monorom",
    description: "This Monorom page could not be found.",
    canonical: absoluteUrl(path, PRODUCTION_ORIGIN),
    robots: "noindex, follow",
    jsonLd: [],
    bodyHtml: "<h1>Page not found</h1>",
  };
}

async function sitemapResponse() {
  const [categories, products, blogs, site] = await Promise.all([
    getJson("/api/category"),
    getJson("/api/product"),
    getJson("/api/blog/public"),
    getJson("/api/siteData/getSiteData"),
  ]);

  const entries = [
    { loc: absoluteUrl("/", PRODUCTION_ORIGIN), lastmod: lastmod(site?.updatedAt) },
    { loc: absoluteUrl("/allProducts", PRODUCTION_ORIGIN) },
    { loc: absoluteUrl("/blogs", PRODUCTION_ORIGIN) },
  ];

  if (contactSeo(site || {}).indexable) {
    entries.push({
      loc: absoluteUrl("/contact", PRODUCTION_ORIGIN),
      lastmod: lastmod(site?.updatedAt),
    });
  }

  Object.keys(CMS_PAGES).forEach((pageKey) => {
    const seo = cmsSeo(pageKey, site?.[pageKey] || "");
    if (!seo.indexable) return;
    entries.push({
      loc: absoluteUrl(seo.path, PRODUCTION_ORIGIN),
      lastmod: lastmod(site?.updatedAt),
    });
  });

  (Array.isArray(categories) ? categories : []).forEach((category) => {
    if (!category?.slug && !category?._id) return;
    entries.push({
      loc: absoluteUrl(categoryPath(category), PRODUCTION_ORIGIN),
      lastmod: lastmod(category.updatedAt),
    });
  });

  (Array.isArray(products) ? products : []).forEach((product) => {
    if (!product?.slug && !product?._id) return;
    entries.push({
      loc: absoluteUrl(productPath(product), PRODUCTION_ORIGIN),
      lastmod: lastmod(product.updatedAt),
    });
  });

  (Array.isArray(blogs) ? blogs : []).forEach((blog) => {
    if (!blogSeo(blog).indexable) return;
    entries.push({
      loc: absoluteUrl(`/blogs/${blog.slug || blog._id}`, PRODUCTION_ORIGIN),
      lastmod: lastmod(blog.updatedAt),
    });
  });

  return new Response(buildSitemapXml(entries), {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600",
    },
  });
}

export default async (request, context) => {
  const url = new URL(request.url);

  if (ALTERNATE_HOSTS.has(url.hostname)) {
    url.hostname = "monoromstore.com";
    url.protocol = "https:";
    return Response.redirect(url.toString(), 301);
  }

  if (url.pathname === "/sitemap.xml") {
    return sitemapResponse();
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return context.next();
  }

  const route = matchSeoPath(url.pathname);
  const userAgent = request.headers.get("user-agent") || "";
  if (!route || !isSearchBot(userAgent)) {
    return context.next();
  }

  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  let page = null;
  try {
    page = await buildPage(route);
  } catch {
    return response;
  }
  if (!page) return response;

  const html = await response.text();
  const headers = new Headers(response.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  headers.set("cache-control", "no-store");
  headers.delete("content-length");
  if (String(page.robots).includes("noindex")) {
    headers.set("x-robots-tag", page.robots);
  }

  return new Response(injectSeoHtml(html, page), {
    status: response.status,
    headers,
  });
};

export const config = {
  path: [
    "/",
    "/sitemap.xml",
    "/allProducts",
    "/category/*",
    "/productDetails/*",
    "/blogs",
    "/blogs/*",
    "/about-us",
    "/terms-of-use",
    "/privacy-policy",
    "/cookie-policy",
    "/contact",
    "/login",
    "/signup",
    "/user/*",
    "/dashboard/*",
  ],
};
