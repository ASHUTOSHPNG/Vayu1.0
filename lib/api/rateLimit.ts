export const RATE_LIMIT_MAP = new Map<string, { count: number; lastReset: number }>();

export function isRateLimited(ip: string, limit: number = 60, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = RATE_LIMIT_MAP.get(ip);

    if (!record) {
        RATE_LIMIT_MAP.set(ip, { count: 1, lastReset: now });
        return false;
    }

    if (now - record.lastReset > windowMs) {
        record.count = 1;
        record.lastReset = now;
        return false;
    }

    if (record.count >= limit) {
        return true;
    }

    record.count++;
    return false;
}
