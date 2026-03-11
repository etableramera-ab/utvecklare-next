'use client'
import { useEffect } from "react";

const SITE_NAME = "utvecklare.ai";
const SITE_URL = "https://utvecklare.ai";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

export interface SEOHeadProps {
  title: string;
  description: string;
  canonical: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const SEOHead = ({
  title,
  description,
  canonical,
  ogType = "website",
  ogImage,
  noindex = false,
  jsonLd,
}: SEOHeadProps) => {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const canonicalUrl = canonical.startsWith("http") ? canonical : `${SITE_URL}${canonical}`;
    const image = ogImage || DEFAULT_OG_IMAGE;

    setMeta("name", "description", description.slice(0, 160));
    setMeta("name", "robots", noindex ? "noindex,nofollow" : "index,follow");
    setMeta("name", "language", "sv");

    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description.slice(0, 160));
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", image);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:locale", "sv_SE");

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description.slice(0, 160));
    setMeta("name", "twitter:image", image);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonicalUrl;

    // Hreflang
    let hreflang = document.querySelector('link[hreflang="sv"]') as HTMLLinkElement;
    if (!hreflang) {
      hreflang = document.createElement("link");
      hreflang.rel = "alternate";
      hreflang.hreflang = "sv";
      document.head.appendChild(hreflang);
    }
    hreflang.href = canonicalUrl;

    // JSON-LD
    document.querySelectorAll('script[data-seo-ld]').forEach(s => s.remove());
    if (jsonLd) {
      const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      items.forEach(item => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo-ld", "true");
        script.textContent = JSON.stringify(item);
        document.head.appendChild(script);
      });
    }

    return () => {
      document.querySelectorAll('script[data-seo-ld]').forEach(s => s.remove());
    };
  }, [title, description, canonical, ogType, ogImage, noindex, jsonLd]);

  return null;
};

export default SEOHead;
