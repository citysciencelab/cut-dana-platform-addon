export function isNullOrWhitespace(str) {
  return str === null || str === undefined || str.trim() === '';
}

/**
 * Fix links in an HTML string to ensure they start with https:// or http://
 *
 * @param {string} htmlString
 * @returns {string}
 */
export function fixLinksInHTMLString(htmlString) {
  if (isNullOrWhitespace(htmlString)) {
    return htmlString;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const elementsWithHref = doc.querySelectorAll('[href]');
  elementsWithHref.forEach((el) => {
    const href = el.getAttribute('href');
    if (href && !href.startsWith('/') && !href.startsWith('http://') && !href.startsWith('https://')) {
      el.setAttribute('href', `https://${href}`);
    }
  });
  const elementsWithSrc = doc.querySelectorAll('[src]');
  elementsWithSrc.forEach((el) => {
    const src = el.getAttribute('src');
    if (src && !src.startsWith('/') && !src.startsWith('http://') && !src.startsWith('https://')) {
      el.setAttribute('src', `https://${src}`);
    }
  });
  return doc.body.innerHTML;
}
