/**
 * Serves an imported standalone storefront document from a TanStack route.
 * The Spanish source pages use root-relative assets without leading slashes;
 * setting the base URL keeps those original paths valid at /mx/* as well.
 */
export function publicHtmlResponse(html: string, rootRelativeAssets = false) {
  const document = rootRelativeAssets
    ? html.replace(/<head(\s[^>]*)?>/i, (head) => `${head}\n    <base href="/" />`)
    : html;

  return new Response(document, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
