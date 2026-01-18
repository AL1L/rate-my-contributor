import DOMPurify from "isomorphic-dompurify";

export function sanitizeInput(input: string): string {
  // Remove all HTML tags and scripts
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}

export function validateSearchInput(input: string): string {
  // Remove special characters that could be used for injection
  // Only allow alphanumeric, spaces, hyphens, underscores
  const sanitized = input.replace(/[^\w\s-]/gi, '');
  
  // Limit length to prevent DOS
  return sanitized.slice(0, 100);
}
