import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, deleteSighting, updateSightingMemo } from '../db';
import { formatDate } from '../lib/format';
import { useObjectUrl } from '../lib/useObjectUrl';
import type { Sighting } from '../types';

function SightingEditForm({ sighting }: { sighting: Sighting }) {
  const navigate = useNavigate();
  const photoUrl = useObjectUrl(sighting.photo);
  const [memo, setMemo] = useState(sighting.memo);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setBusy(true);
    setError('');
    try {
      await updateSightingMemo(sighting.id, memo.trim());
      navigate(-1);
    } catch {
      setError('保存できませんでした。もう一度お試しください。');
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    setError('');
    try {
      const [cat, count] = await Promise.all([
        db.cats.get(sighting.catId),
        db.sightings.where('catId').equals(sighting.catId).count(),
      ]);
      const isLast = count <= 1;
      const message = isLast
        ? `最後の記録です。削除すると、${cat?.name ?? 'この猫'}のメモやさくら耳の情報も一緒に消えます。元に戻せません。`
        : 'この記録を削除しますか？元に戻せません。';
      if (!window.confirm(message)) {
        setBusy(false);
        return;
      }
      await deleteSighting(sighting);
      if (isLast) navigate('/gallery', { replace: true });
      else navigate(-1);
    } catch {
      setError('削除できませんでした。もう一度お試しください。');
      setBusy(false);
    }
  };

  return (
    <div className="add-page">
      <header className="add-header">
        <button type="button" className="text-button" onClick={() => navigate(-1)}>
          閉じる
        </button>
        <h1>記録を編集</h1>
      </header>

      <div className="add-body">
        <section className="add-section">
          <div className="add-photo-summary">
            {photoUrl && <img className="add-preview" src={photoUrl} alt="記録の写真" />}
            <p className="add-date">{formatDate(sighting.takenAt)}</p>
          </div>
          <label className="field">
            今回のメモ（任意）
            <textarea rows={3} value={memo} onChange={(e) => setMemo(e.target.value)} />
          </label>
          <button type="button" className="button primary" disabled={busy} onClick={handleSave}>
            {busy ? '処理中…' : '保存'}
          </button>
          <button type="button" className="button danger" disabled={busy} onClick={handleDelete}>
            この記録を削除
          </button>
        </section>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default function SightingEditPage() {
  const { id = '' } = useParams();
  // 未取得はundefined、見つからないときはnullで区別する
  const sighting = useLiveQuery(async () => (await db.sightings.get(id)) ?? null, [id]);

  if (sighting === undefined) return null;
  if (sighting === null) {
    return (
      <div className="page">
        <Link to="/gallery" className="back-link">‹ ギャラリー</Link>
        <p className="empty">この記録は見つかりませんでした。</p>
      </div>
    );
  }

  return <SightingEditForm sighting={sighting} />;
}
