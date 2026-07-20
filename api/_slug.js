// Blob pathnames for news PDFs. The pathname is what a reader sees as the
// filename when saving the document, so it carries the article title.
// Underscore prefix keeps Vercel from exposing this as an endpoint.
//
// Shared by /api/publish-news and /api/rename-news-pdfs so a migrated PDF gets
// byte-identical naming to a freshly published one.

function slugify(title) {
  const slug = String(title || '')
    .toLowerCase()
    .replace(/[äàáâ]/g, 'a').replace(/[öòóô]/g, 'o').replace(/[üùúû]/g, 'u')
    .replace(/[èéêë]/g, 'e').replace(/[ç]/g, 'c').replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');
  return slug || 'report';
}

function pdfPathname(title, id) {
  return 'news/pdfs/' + slugify(title) + '-' + id + '.pdf';
}

module.exports = { slugify, pdfPathname };
