import Dexie, { type EntityTable } from 'dexie';
import type { Cat, CatProfile, Sighting } from './types';

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

export async function updateCat(id: string, profile: CatProfile) {
  await db.cats.update(id, profile);
}

/** iPhoneのSafariでは更新直後に写真が表示されないことがあるので、写真を新しいBlobにして書き戻す */
export async function updateSightingMemo(id: string, memo: string) {
  const sighting = await db.sightings.get(id);
  if (!sighting || sighting.memo === memo) return;
  const photo = new Blob([await sighting.photo.arrayBuffer()], { type: sighting.photo.type });
  await db.sightings.update(id, { memo, photo });
}

/** 記録を削除する。最後の1件なら猫も一緒に消す */
export async function deleteSighting(sighting: Sighting) {
  await db.transaction('rw', db.cats, db.sightings, async () => {
    await db.sightings.delete(sighting.id);
    const remaining = await db.sightings.where('catId').equals(sighting.catId).count();
    if (remaining === 0) await db.cats.delete(sighting.catId);
  });
}
