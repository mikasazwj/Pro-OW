// Sensitive word filter
const SENSITIVE_WORDS = ['fuck', 'shit', 'damn', 'asshole', 'bitch', 'bastard', 'idiot', 'stupid', 'dumb'];

export function filterContent(text: string): { filtered: string; hasFiltered: boolean } {
  let result = text;
  let hasFiltered = false;
  for (const word of SENSITIVE_WORDS) {
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    if (regex.test(result)) {
      result = result.replace(regex, '***');
      hasFiltered = true;
    }
  }
  return { filtered: result, hasFiltered };
}

// Simple in-memory rate limiter
const rateMap = new Map<string, number[]>();

export function calculateLevel(exp: number): string {
  if (exp >= 3000) return 'Top500';
  if (exp >= 2200) return 'Grandmaster';
  if (exp >= 1500) return 'Master';
  if (exp >= 1000) return 'Diamond';
  if (exp >= 600) return 'Platinum';
  if (exp >= 300) return 'Gold';
  if (exp >= 100) return 'Silver';
  return 'Bronze';
}

export function checkRateLimit(userId: string, action: string, maxCount: number, windowMs: number): boolean {
  const key = userId + ':' + action;
  const now = Date.now();
  const timestamps = rateMap.get(key) || [];
  const recent = timestamps.filter(t => now - t < windowMs);
  if (recent.length >= maxCount) return false;
  recent.push(now);
  rateMap.set(key, recent);
  return true;
}