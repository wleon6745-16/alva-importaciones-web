import { siteConfig } from "./site-config";

export interface SeoProps {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noindex?: boolean;
}

export function resolveSeo({
  title,
  description = siteConfig.description,
  path = "/",
  image = "/og-image.jpg",
  noindex = false,
}: SeoProps) {
  const fullTitle = title === siteConfig.name ? title : `${title} | ${siteConfig.name}`;
  const canonicalUrl = new URL(path, siteConfig.url).toString();
  const imageUrl = new URL(image, siteConfig.url).toString();

  return {
    title: fullTitle,
    description,
    canonicalUrl,
    imageUrl,
    noindex,
  };
}
