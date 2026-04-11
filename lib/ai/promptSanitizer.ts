const INJECTION_PATTERNS = [
  /ignore previous instructions/gi,
  /you are now/gi,
  /system prompt/gi,
  /disregard/gi,
  /pretend you are/gi,
  /forget everything/gi,
  /override your/gi,
  /new instructions/gi,
];

export function detectPromptInjection(input: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}
