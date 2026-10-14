// Shared filtering for Command Palette and Combobox: every word of the query must appear somewhere
// in the item's text; items whose label starts with the query rank first, then label matches, then
// the rest. Ties keep their original order.

export function rankMatches<T>(
  items: readonly T[],
  query: string,
  getLabel: (item: T) => string,
  getText: (item: T) => string = getLabel
): T[] {
  const raw = query.trim().toLowerCase();
  if (!raw) return [...items];
  const tokens = raw.split(/\s+/);

  const rank = (item: T) => {
    const label = getLabel(item).toLowerCase();
    if (label.startsWith(raw)) return 0;
    if (label.includes(raw)) return 1;
    return 2;
  };

  return items
    .map((item, index) => ({ item, index, haystack: getText(item).toLowerCase() }))
    .filter(({ haystack }) => tokens.every((token) => haystack.includes(token)))
    .map((entry) => ({ ...entry, score: rank(entry.item) }))
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map(({ item }) => item);
}
