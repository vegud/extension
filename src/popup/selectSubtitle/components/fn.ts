export const sort = <T>(arr: T[], comparator: (a: T, b: T) => number): T[] => [...arr].sort(comparator);

export const episodeComparator = (a: {episode: string}, b: {episode: string}): number => a.episode.localeCompare(b.episode, "en", {numeric: true});

export const groupBy = <T>({ arr, key, groupComparator }: {arr: T[], key: keyof T, groupComparator: (a: T, b: T) => number}): Map<string, T[]> => arr.reduce((map, entry) => map.set(entry[key], sort([...(map.get(entry[key]) ?? []), entry], groupComparator)), new Map());
