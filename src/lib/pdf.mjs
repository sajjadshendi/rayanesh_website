// Keep repository PDFs on GitHub's raw host, independent of the site's CDN.
// External media URLs remain available for issues hosted elsewhere.
export function pdfDownloadUrl(path) {
  if (!/^\/downloads\/[a-zA-Z0-9_-]+\.pdf(?:#page=\d+)?$/.test(path)) return path;
  return 'https://raw.githubusercontent.com/sajjadshendi/rayanesh_website/main/public' + path;
}
