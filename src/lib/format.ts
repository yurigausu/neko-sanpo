import type { SakuraMimi } from '../types';

export function formatDate(time: number) {
  return new Date(time).toLocaleDateString('ja-JP');
}

export const SAKURA_MIMI_LABELS: Record<SakuraMimi, string> = {
  yes: '🌸 さくら耳',
  no: 'さくら耳なし',
  unknown: 'さくら耳？',
};
