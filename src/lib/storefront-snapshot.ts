// Lectura de la instantanea del catalogo (src/content/storefront/*.json).

interface SnapshotPaging {
  firstPage: unknown[];
  firstPageHasMore?: boolean;
  /** Solo en instantaneas antiguas: la API publica ya no envia totales. */
  firstPageTotal?: number;
}

/** ¿Hay mas productos despues de la primera pagina? */
export function hasMoreProducts(snapshot: SnapshotPaging): boolean {
  if (typeof snapshot.firstPageHasMore === "boolean") return snapshot.firstPageHasMore;
  return typeof snapshot.firstPageTotal === "number" && snapshot.firstPageTotal > snapshot.firstPage.length;
}
