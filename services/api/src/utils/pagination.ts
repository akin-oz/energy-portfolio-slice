import { buildPageInfo, decodeCursor, encodeCursor } from "@energy-portfolio/shared/pagination";

export interface PaginationArgs {
  first?: number;
  after?: string | null;
}

export function paginateByCreatedAt<T extends { createdAt: string; id: string }>(
  items: T[],
  opts: PaginationArgs & { pk: string; defaultLimit?: number },
) {
  const limit = Math.max(1, Math.min(opts.first ?? opts.defaultLimit ?? 20, 100));

  // Ensure stable ordering with tie-breaker by id
  const ordered = [...items].sort((a, b) => {
    const t = a.createdAt.localeCompare(b.createdAt);
    if (t !== 0) return t;
    return a.id.localeCompare(b.id);
  });

  let startIndex = 0;
  if (opts.after) {
    const c = decodeCursor(opts.after);
    if (c.pk !== opts.pk) {
      return { edges: [], pageInfo: { endCursor: null, hasNextPage: false } };
    }
    const afterIndex = ordered.findIndex((it) => `${it.createdAt}#${it.id}` === c.sk);
    if (afterIndex === -1) return { edges: [], pageInfo: { endCursor: null, hasNextPage: false } };
    startIndex = afterIndex + 1;
  }

  const windowWithExtra = ordered.slice(startIndex, startIndex + limit + 1);
  const slice = windowWithExtra.slice(0, limit);

  const pageInfo = buildPageInfo(
    windowWithExtra.map((it) => ({ pk: opts.pk, sk: `${it.createdAt}#${it.id}` })),
    limit,
  );

  const edges = slice.map((node) => ({
    node,
    cursor: encodeCursor({ pk: opts.pk, sk: `${node.createdAt}#${node.id}` }),
  }));

  return { edges, pageInfo };
}
