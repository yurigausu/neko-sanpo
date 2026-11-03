import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import CatFields from '../components/CatFields';
import { db, updateCat } from '../db';
import type { Cat, CatProfile } from '../types';

function CatEditForm({ cat }: { cat: Cat }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CatProfile>({
    name: cat.name,
    memo: cat.memo,
    sakuraMimi: cat.sakuraMimi,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setBusy(true);
    setError('');
    try {
      await updateCat(cat.id, { ...profile, name: profile.name.trim(), memo: profile.memo.trim() });
      navigate(-1);
    } catch {
      setError('保存できませんでした。もう一度お試しください。');
      setBusy(false);
    }
  };

  return (
    <div className="add-page">
      <header className="add-header">
        <button type="button" className="text-button" onClick={() => navigate(-1)}>
          閉じる
        </button>
        <h1>猫を編集</h1>
      </header>

      <div className="add-body">
        <section className="add-section">
          <CatFields value={profile} onChange={setProfile} />
          <button
            type="button"
            className="button primary"
            disabled={busy || profile.name.trim() === ''}
            onClick={handleSave}
          >
            {busy ? '保存中…' : '保存'}
          </button>
        </section>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default function CatEditPage() {
  const { id = '' } = useParams();
  // 未取得はundefined、見つからないときはnullで区別する
  const cat = useLiveQuery(async () => (await db.cats.get(id)) ?? null, [id]);

  if (cat === undefined) return null;
  if (cat === null) {
    return (
      <div className="page">
        <Link to="/gallery" className="back-link">‹ ギャラリー</Link>
        <p className="empty">この猫は見つかりませんでした。</p>
      </div>
    );
  }

  return <CatEditForm cat={cat} />;
}
