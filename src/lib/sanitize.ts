export function sanitizeInput(input: string): string {
  // TODO: Make better
  // Remove all HTML tags and scripts
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

export function validateSearchInput(input: string): string {
  // Remove special characters that could be used for injection
  // Only allow alphanumeric, spaces, hyphens, underscores
  const sanitized = input.replace(/[^\w\s-]/gi, '');
  
  // Limit length to prevent DOS
  return sanitized.slice(0, 100);
}
