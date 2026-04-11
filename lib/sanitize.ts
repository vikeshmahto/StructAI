export function sanitizePrompt(input: string): string {
  // Remove any HTML tags
  const clean = input.replace(/<[^>]*>/g, "");
  // Limit length
  return clean.slice(0, 2000).trim();
}
