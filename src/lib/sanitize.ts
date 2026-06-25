import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(dirty: string): string {
  if (!dirty) return "";
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
  });
}
