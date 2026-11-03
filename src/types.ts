export type SakuraMimi = 'yes' | 'no' | 'unknown'; // さくら耳（TNR済みの目印）

export interface Cat {
  id: string;
  name: string;
  memo: string;
  sakuraMimi: SakuraMimi;
  createdAt: number;
}

// 登録と編集で入力する項目
export type CatProfile = Pick<Cat, 'name' | 'memo' | 'sakuraMimi'>;

// 出会い記録（写真1枚＝出会い1回）
export interface Sighting {
  id: string;
  catId: string;
  photo: Blob;
  takenAt: number;
  lat: number;
  lng: number;
  memo: string;
  createdAt: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}
