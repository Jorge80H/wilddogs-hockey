import { useEffect } from "react";

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: "website" | "article";
}

const BASE_DOMAIN = "https://optimawilddogs.com";
const DEFAULT_IMAGE = `${BASE_DOMAIN}/logo-wild-dogs.jpg`;
const SITE_NAME = "Optima Wild Dogs Hockey Club";

function setMeta(name: string, content: string, useProperty = false) {
    const attr = useProperty ? "property" : "name";
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
}

function setCanonical(url: string) {
    let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!el) {
        el = document.createElement("link");
        el.rel = "canonical";
        document.head.appendChild(el);
    }
    el.href = url;
}

export function useSEO({
    title,
    description,
    image = DEFAULT_IMAGE,
    url,
    type = "website",
}: SEOProps = {}) {
    useEffect(() => {
        const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
        const fullUrl = url ? `${BASE_DOMAIN}${url}` : BASE_DOMAIN;

        // Basic
        document.title = fullTitle;

        if (description) {
            setMeta("description", description);
        }

        // Robots
        setMeta("robots", "index, follow");

        // Canonical
        setCanonical(fullUrl);

        // Open Graph
        setMeta("og:type", type, true);
        setMeta("og:site_name", SITE_NAME, true);
        setMeta("og:title", fullTitle, true);
        if (description) setMeta("og:description", description, true);
        setMeta("og:url", fullUrl, true);
        setMeta("og:image", image, true);
        setMeta("og:image:width", "1200", true);
        setMeta("og:image:height", "630", true);
        setMeta("og:locale", "es_CO", true);

        // Twitter Card
        setMeta("twitter:card", "summary_large_image");
        setMeta("twitter:title", fullTitle);
        if (description) setMeta("twitter:description", description);
        setMeta("twitter:image", image);
        setMeta("twitter:site", "@optimawilddogs");
    }, [title, description, image, url, type]);
}
