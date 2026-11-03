import { db } from '../db';
import type { Cat, Sighting } from '../types';

export interface CatSummary {
  cat: Cat;
  count: number;
  latest: Sighting | undefined;
}

/** 猫ごとの会えた回数と最新の出会いを、最近会った順に返す */
export async function getCatSummaries(): Promise<CatSummary[]> {
  const [cats, sightings] = await Promise.all([db.cats.toArray(), db.sightings.orderBy('takenAt').toArray()]);

  const summaries = new Map<string, CatSummary>(
    cats.map((cat) => [cat.id, { cat, count: 0, latest: undefined }]),
  );
  for (const sighting of sightings) {
    const summary = summaries.get(sighting.catId);
    if (!summary) continue;
    summary.count += 1;
    summary.latest = sighting; // takenAtの昇順なので最後が最新
  }

  return [...summaries.values()].sort(
    (a, b) => (b.latest?.takenAt ?? b.cat.createdAt) - (a.latest?.takenAt ?? a.cat.createdAt),
  );
}
