const DANGEROUS_PATTERNS: RegExp[] = [
  /\bsystem\s*:/gi,
  /\bassistant\s*:/gi,
  /\buser\s*:/gi,
  /ignore\s+(all\s+)?previous\s+instructions/gi,
  /ignore\s+(all\s+)?above\s+instructions/gi,
  /forget\s+(all\s+)?previous/gi,
  /you\s+are\s+now\s+a/gi,
  /act\s+as\s+(a\s+)?/gi,
  /pretend\s+(you\s+are|to\s+be)/gi,
  /role\s*:\s*/gi,
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /```\s*(system|prompt|instruction)/gi,
  /\bDAN\b/g,
  /do\s+anything\s+now/gi,
  /jailbreak/gi,
  /\boverride\b/gi,
];

export function guardContext(input: string): string {
  let sanitized = input;

  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }

  sanitized = sanitized
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();

  if (sanitized.length > 10000) {
    sanitized = sanitized.slice(0, 10000);
  }

  return sanitized;
}

export function validateAIResponse(
  response: string,
  expectedShape: Record<string, string>
): boolean {
  let parsed: unknown;

  try {
    parsed = JSON.parse(response);
  } catch {
    return false;
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return false;
  }

  const record = parsed as Record<string, unknown>;

  for (const [key, expectedType] of Object.entries(expectedShape)) {
    if (!(key in record)) {
      return false;
    }

    const value = record[key];

    switch (expectedType) {
      case "string":
        if (typeof value !== "string") return false;
        break;
      case "number":
        if (typeof value !== "number") return false;
        break;
      case "boolean":
        if (typeof value !== "boolean") return false;
        break;
      case "array":
        if (!Array.isArray(value)) return false;
        break;
      case "object":
        if (typeof value !== "object" || value === null || Array.isArray(value))
          return false;
        break;
      default:
        return false;
    }
  }

  return true;
}
