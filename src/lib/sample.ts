import { db } from '../db';
import type { Cat, Sighting } from '../types';

const SAMPLE_NOTE = 'サンプルです（写真は生成AI、場所は架空）';

function sampleTime(dateTime: string) {
  return new Date(`${dateTime}+09:00`).getTime();
}

const SAMPLE_CATS: Cat[] = [
  {
    id: 'sample-cat-a',
    name: 'とらお',
    memo: `日なたが大好きなキジトラ。${SAMPLE_NOTE}`,
    sakuraMimi: 'no',
    createdAt: sampleTime('2026-10-04T10:20:00'),
  },
  {
    id: 'sample-cat-b',
    name: 'はな',
    memo: `石碑のそばでよく見かける三毛猫。${SAMPLE_NOTE}`,
    sakuraMimi: 'no',
    createdAt: sampleTime('2026-10-11T14:05:00'),
  },
  {
    id: 'sample-cat-c',
    name: '大将',
    memo: `どっしり構えた白黒の猫。${SAMPLE_NOTE}`,
    sakuraMimi: 'no',
    createdAt: sampleTime('2026-10-18T11:40:00'),
  },
];

// 写真以外の項目。写真はボタンを押したときに取得する
const SAMPLE_SIGHTINGS: (Omit<Sighting, 'photo' | 'createdAt'> & { file: string })[] = [
  {
    id: 'sample-sighting-a-3',
    catId: 'sample-cat-a',
    file: 'cat-a-3.jpg',
    takenAt: sampleTime('2026-10-04T10:20:00'),
    lat: 35.7148,
    lng: 139.7738,
    memo: '木陰からじっと見ていた',
  },
  {
    id: 'sample-sighting-a-2',
    catId: 'sample-cat-a',
    file: 'cat-a-2.jpg',
    takenAt: sampleTime('2026-10-15T09:30:00'),
    lat: 35.7141,
    lng: 139.7735,
    memo: '背筋がぴんとしていた',
  },
  {
    id: 'sample-sighting-a-1',
    catId: 'sample-cat-a',
    file: 'cat-a-1.jpg',
    takenAt: sampleTime('2026-10-25T13:10:00'),
    lat: 35.7152,
    lng: 139.7745,
    memo: '日なたでうとうと',
  },
  {
    id: 'sample-sighting-b-2',
    catId: 'sample-cat-b',
    file: 'cat-b-2.jpg',
    takenAt: sampleTime('2026-10-11T14:05:00'),
    lat: 35.7113,
    lng: 139.7727,
    memo: '念入りに毛づくろい中',
  },
  {
    id: 'sample-sighting-b-1',
    catId: 'sample-cat-b',
    file: 'cat-b-1.jpg',
    takenAt: sampleTime('2026-10-22T15:45:00'),
    lat: 35.7118,
    lng: 139.7726,
    memo: 'こちらを見て立ち止まった',
  },
  {
    id: 'sample-sighting-c-1',
    catId: 'sample-cat-c',
    file: 'cat-c-1.jpg',
    takenAt: sampleTime('2026-10-18T11:40:00'),
    lat: 35.7127,
    lng: 139.7734,
    memo: '香箱座りで動かない',
  },
];

async function fetchPhoto(file: string): Promise<Blob> {
  const response = await fetch(`${import.meta.env.BASE_URL}sample/${file}`);
  if (!response.ok) throw new Error(`サンプル画像を取得できませんでした: ${file}`);
  return response.blob();
}

/** サンプルを保存する。IDが固定なので、読み込み直すとサンプルだけが初期状態に戻る */
export async function loadSampleData(): Promise<Sighting[]> {
  // トランザクションはfetchの待ち時間中に閉じるので、先に全部取得する
  const sightings: Sighting[] = await Promise.all(
    SAMPLE_SIGHTINGS.map(async ({ file, ...sighting }) => ({
      ...sighting,
      photo: await fetchPhoto(file),
      createdAt: sighting.takenAt,
    })),
  );

  await db.transaction('rw', db.cats, db.sightings, async () => {
    await db.cats.bulkPut(SAMPLE_CATS);
    await db.sightings.bulkPut(sightings);
  });
  return sightings;
}
