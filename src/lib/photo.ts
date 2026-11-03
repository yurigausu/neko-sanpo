import exifr from 'exifr';
import type { LatLng } from '../types';

const MAX_LONG_EDGE = 1280;
const JPEG_QUALITY = 0.85;

export interface PhotoMeta {
  takenAt: number | null;
  location: LatLng | null;
}

/** EXIFから撮影日時と位置を読む。読めない項目はnullにする */
export async function readPhotoMeta(file: File): Promise<PhotoMeta> {
  try {
    const exif = await exifr.parse(file, { gps: true });
    const date: unknown = exif?.DateTimeOriginal ?? exif?.CreateDate;
    const lat: unknown = exif?.latitude;
    const lng: unknown = exif?.longitude;
    return {
      takenAt: date instanceof Date && !Number.isNaN(date.getTime()) ? date.getTime() : null,
      location:
        typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng)
          ? { lat, lng }
          : null,
    };
  } catch {
    return { takenAt: null, location: null };
  }
}

/** 長辺を1280px以下のJPEGにする。写真の向きはブラウザが<img>のデコード時に反映する */
export async function resizePhoto(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();

    const scale = Math.min(1, MAX_LONG_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('JPEGへの変換に失敗しました'))),
        'image/jpeg',
        JPEG_QUALITY,
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
