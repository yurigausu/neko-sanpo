import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import LocationPicker from '../components/LocationPicker';
import { db, saveSighting } from '../db';
import { formatDate } from '../lib/format';
import { readPhotoMeta, resizePhoto } from '../lib/photo';
import { useObjectUrl } from '../lib/useObjectUrl';
import { createId } from '../lib/id';
import type { Cat, LatLng, SakuraMimi } from '../types';

type Step = 'photo' | 'location' | 'cat';

interface PickedPhoto {
  blob: Blob;
  takenAt: number;
  hasExifDate: boolean;
  hasExifLocation: boolean;
}

const NEW_CAT = 'new';

const SAKURA_OPTIONS: { value: SakuraMimi; label: string }[] = [
  { value: 'unknown', label: 'わからない' },
  { value: 'yes', label: 'あり' },
  { value: 'no', label: 'なし' },
];

export default function AddPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('photo');
  const [photo, setPhoto] = useState<PickedPhoto | null>(null);
  const [location, setLocation] = useState<LatLng | null>(null);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catMemo, setCatMemo] = useState('');
  const [sakuraMimi, setSakuraMimi] = useState<SakuraMimi>('unknown');
  const [sightingMemo, setSightingMemo] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const photoUrl = useObjectUrl(photo?.blob);
  const cats = useLiveQuery(() => db.cats.orderBy('createdAt').reverse().toArray());
  const lastSighting = useLiveQuery(() => db.sightings.orderBy('takenAt').last());

  // 未選択なら、猫がいれば選ばせ、いなければ新規登録にする
  const catChoice = selectedCatId ?? (cats?.length === 0 ? NEW_CAT : null);
  const canSave = !busy && (catChoice === NEW_CAT ? catName.trim() !== '' : catChoice !== null);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 同じ写真を選び直せるようにする
    if (!file) return;

    setBusy(true);
    setError('');
    try {
      const [meta, blob] = await Promise.all([readPhotoMeta(file), resizePhoto(file)]);
      setPhoto({
        blob,
        takenAt: meta.takenAt ?? Date.now(),
        hasExifDate: meta.takenAt !== null,
        hasExifLocation: meta.location !== null,
      });
      setLocation(meta.location);
      setStep('location');
    } catch {
      setError('この写真は読み込めませんでした。別の写真を選んでください。');
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    if (!photo || !location || !catChoice) return;

    const now = Date.now();
    const newCat: Cat | undefined =
      catChoice === NEW_CAT
        ? { id: createId(), name: catName.trim(), memo: catMemo.trim(), sakuraMimi, createdAt: now }
        : undefined;
    const catId = newCat?.id ?? catChoice;

    setBusy(true);
    setError('');
    try {
      await saveSighting(
        {
          id: createId(),
          catId,
          photo: photo.blob,
          takenAt: photo.takenAt,
          lat: location.lat,
          lng: location.lng,
          memo: sightingMemo.trim(),
          createdAt: now,
        },
        newCat,
      );
      navigate(`/cats/${catId}`, { replace: true });
    } catch {
      // SafariのプライベートブラウズはIndexedDBにBlobを保存できない
      setError('保存できませんでした。プライベートブラウズでは保存できないので、通常のタブで開いてください。');
      setBusy(false);
    }
  };

  return (
    <div className="add-page">
      <header className="add-header">
        {step === 'photo' ? (
          <button type="button" className="text-button" onClick={() => navigate(-1)}>
            閉じる
          </button>
        ) : (
          <button type="button" className="text-button" onClick={() => setStep(step === 'cat' ? 'location' : 'photo')}>
            ‹ 戻る
          </button>
        )}
        <h1>記録を追加</h1>
        <span className="add-step">{{ photo: 1, location: 2, cat: 3 }[step]} / 3</span>
      </header>

      <div className="add-body">
        {step === 'photo' && (
          <section className="add-section">
            <p className="add-lead">出会った猫の写真を選んでください</p>
            <label className={`button primary${busy ? ' disabled' : ''}`}>
              {busy ? '読み込み中…' : '写真を選ぶ'}
              <input
                type="file"
                accept="image/*"
                className="visually-hidden"
                onChange={handleFile}
                disabled={busy}
                data-testid="photo-input"
              />
            </label>
          </section>
        )}

        {step === 'location' && photo && (
          <section className="add-section">
            <div className="add-photo-summary">
              {photoUrl && <img className="add-preview" src={photoUrl} alt="選んだ写真" />}
              <div>
                <p className="add-date">
                  {photo.hasExifDate
                    ? `${formatDate(photo.takenAt)} に撮影`
                    : `撮影日が不明なので ${formatDate(photo.takenAt)} で記録します`}
                </p>
                <p className="add-lead">
                  {photo.hasExifLocation
                    ? '写真の位置情報を読み取りました。違うときは地図をタップして直せます。'
                    : '写真に位置情報がありませんでした。現在地を使うか、地図をタップしてピンを置いてください。'}
                </p>
              </div>
            </div>
            <LocationPicker
              value={location}
              onChange={setLocation}
              fallbackCenter={lastSighting ? { lat: lastSighting.lat, lng: lastSighting.lng } : undefined}
            />
            <button type="button" className="button primary" disabled={!location} onClick={() => setStep('cat')}>
              次へ
            </button>
          </section>
        )}

        {step === 'cat' && (
          <section className="add-section">
            <p className="add-lead">どの猫ですか？</p>
            <div className="cat-choices">
              {cats?.map((cat) => (
                <label key={cat.id} className={`cat-choice${catChoice === cat.id ? ' selected' : ''}`}>
                  <input
                    type="radio"
                    name="cat"
                    className="visually-hidden"
                    checked={catChoice === cat.id}
                    onChange={() => setSelectedCatId(cat.id)}
                  />
                  {cat.name}
                </label>
              ))}
              <label className={`cat-choice${catChoice === NEW_CAT ? ' selected' : ''}`}>
                <input
                  type="radio"
                  name="cat"
                  className="visually-hidden"
                  checked={catChoice === NEW_CAT}
                  onChange={() => setSelectedCatId(NEW_CAT)}
                />
                ＋ 新しい猫
              </label>
            </div>

            {catChoice === NEW_CAT && (
              <div className="new-cat-form">
                <label className="field">
                  名前
                  <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} />
                </label>
                <label className="field">
                  猫のメモ
                  <textarea rows={2} value={catMemo} onChange={(e) => setCatMemo(e.target.value)} />
                </label>
                <fieldset className="field">
                  <legend>さくら耳</legend>
                  <div className="segmented">
                    {SAKURA_OPTIONS.map((option) => (
                      <label key={option.value} className={sakuraMimi === option.value ? 'selected' : ''}>
                        <input
                          type="radio"
                          name="sakura"
                          className="visually-hidden"
                          checked={sakuraMimi === option.value}
                          onChange={() => setSakuraMimi(option.value)}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}

            <label className="field">
              今回のメモ（任意）
              <textarea rows={2} value={sightingMemo} onChange={(e) => setSightingMemo(e.target.value)} />
            </label>

            <button type="button" className="button primary" disabled={!canSave} onClick={handleSave}>
              {busy ? '保存中…' : '保存'}
            </button>
          </section>
        )}

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
