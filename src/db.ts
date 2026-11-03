import Dexie, { type EntityTable } from 'dexie';
import type { Cat, Sighting } from './types';

export const db = new Dexie('neko-sanpo') as Dexie & {
  cats: EntityTable<Cat, 'id'>;
  sightings: EntityTable<Sighting, 'id'>;
};

db.version(1).stores({
  cats: 'id, createdAt',
  sightings: 'id, catId, takenAt',
});

/** 新しい猫（任意）と出会い記録を1つのトランザクションで保存する */
export async function saveSighting(sighting: Sighting, newCat?: Cat) {
  await db.transaction('rw', db.cats, db.sightings, async () => {
    if (newCat) await db.cats.add(newCat);
    await db.sightings.add(sighting);
  });
}
