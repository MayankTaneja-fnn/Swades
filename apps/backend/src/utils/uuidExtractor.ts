// UUID extraction utility
export const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export function extractUUID(text: string): string | null {
    const match = text.match(UUID_REGEX);
    return match ? match[0] : null;
}

export function extractAllUUIDs(text: string): string[] {
    const matches = text.matchAll(new RegExp(UUID_REGEX, 'gi'));
    return Array.from(matches, m => m[0]);
}
