/**
 * Utilities for normalizing and formatting phone numbers.
 * Keeps things simple without a heavy libphonenumber dependency.
 */
class PhoneService {
  /**
   * Strip everything except digits and leading +
   * e.g. "+91 98765-43210" → "+919876543210"
   */
  normalize(raw: string): string {
    const stripped = raw.replace(/[^\d+]/g, '');
    // Collapse multiple + signs
    return stripped.replace(/\++/, '+');
  }

  /**
   * Normalize an array and return unique values
   */
  normalizeMany(numbers: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const n of numbers) {
      const normalized = this.normalize(n);
      if (normalized && !seen.has(normalized)) {
        seen.add(normalized);
        result.push(normalized);
      }
    }
    return result;
  }

  /**
   * Simple display formatter – adds spaces for readability.
   * Falls back to the raw string if nothing matches.
   */
  format(normalized: string): string {
    // Indian numbers: +91XXXXXXXXXX → +91 XXXXX XXXXX
    const indiaMatch = normalized.match(/^\+91(\d{5})(\d{5})$/);
    if (indiaMatch) return `+91 ${indiaMatch[1]} ${indiaMatch[2]}`;

    // US/Canada: +1XXXXXXXXXX → +1 (XXX) XXX-XXXX
    const usMatch = normalized.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
    if (usMatch) return `+1 (${usMatch[1]}) ${usMatch[2]}-${usMatch[3]}`;

    return normalized;
  }

  /**
   * Check whether two phone strings refer to the same number
   */
  isSame(a: string, b: string): boolean {
    return this.normalize(a) === this.normalize(b);
  }
}

export const phoneService = new PhoneService();