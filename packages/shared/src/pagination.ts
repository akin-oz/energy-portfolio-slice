export interface CursorPayload {
    pk: string;
    sk: string;
}

export function encodeCursor(payload: CursorPayload): string {
    const json = JSON.stringify(payload);
    return Buffer.from(json, "utf8").toString("base64url");
}

export function decodeCursor(cursor: string): CursorPayload {
    try {
        const json = Buffer.from(cursor, "base64url").toString("utf8");
        const parsed = JSON.parse(json) as CursorPayload;

        if (!parsed.pk || !parsed.sk) {
            throw new Error("Invalid cursor payload");
        }

        return parsed;
    } catch {
        throw new Error("Invalid cursor");
    }
}

export interface PageInfo {
    endCursor: string | null;
    hasNextPage: boolean;
}

export function buildPageInfo(
    items: { pk: string; sk: string }[],
    limit: number
): PageInfo {
    if (items.length === 0) {
        return {
            endCursor: null,
            hasNextPage: false
        };
    }

    const hasNextPage = items.length > limit;
    const slice = hasNextPage ? items.slice(0, limit) : items;
    const last = slice.at(-1) ?? items[0];

    return {
        endCursor: encodeCursor({pk: last.pk, sk: last.sk}),
        hasNextPage
    };
}