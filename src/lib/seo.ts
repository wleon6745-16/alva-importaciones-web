import { siteConfig, canonicalPath } from "./site-config";

export interface SeoProps {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noindex?: boolean;
}

export function resolveSeo({
  title,
  description,
  path = "/",
  image = "/og-image.jpg",
  noindex = false,
}: SeoProps) {
  // La portada usa su propio titulo largo (marca + que vendemos + donde); el resto, "Pagina | Marca".
  const fullTitle = title === siteConfig.name ? siteConfig.homeTitle : title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`;
  const isHome = title === siteConfig.name;
  const finalDescription = description ?? (isHome ? siteConfig.homeDescription : siteConfig.description);
  const canonicalUrl = new URL(canonicalPath(path), siteConfig.url).toString();
  const imageUrl = new URL(image, siteConfig.url).toString();

  return {
    title: fullTitle,
    description: finalDescription,
    canonicalUrl,
    imageUrl,
    noindex,
  };
}
