import { Link, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { SAKURA_MIMI_LABELS, formatDate } from '../lib/format';
import { useObjectUrl } from '../lib/useObjectUrl';
import type { Sighting } from '../types';

function SightingPhoto({ sighting }: { sighting: Sighting }) {
  const photoUrl = useObjectUrl(sighting.photo);

  return (
    <figure className="sighting">
      <div className="sighting-photo">{photoUrl && <img src={photoUrl} alt="" />}</div>
      <figcaption>
        <time dateTime={new Date(sighting.takenAt).toISOString()}>{formatDate(sighting.takenAt)}</time>
        {sighting.memo && <p>{sighting.memo}</p>}
      </figcaption>
    </figure>
  );
}

export default function CatDetailPage() {
  const { id = '' } = useParams();
  // 未取得はundefined、見つからないときはnullで区別する
  const cat = useLiveQuery(async () => (await db.cats.get(id)) ?? null, [id]);
  const sightings = useLiveQuery(
    async () => (await db.sightings.where('catId').equals(id).sortBy('takenAt')).reverse(),
    [id],
  );

  if (cat === undefined) return null;
  if (cat === null) {
    return (
      <div className="page">
        <Link to="/gallery" className="back-link">‹ ギャラリー</Link>
        <p className="empty">この猫は見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div className="page">
      <nav className="page-nav">
        <Link to="/gallery" className="back-link">‹ ギャラリー</Link>
        <Link to={`/cats/${cat.id}/edit`} className="back-link">編集</Link>
      </nav>
      <h1 className="page-title">{cat.name}</h1>
      <p className="cat-meta">
        <span className="sakura-label">{SAKURA_MIMI_LABELS[cat.sakuraMimi]}</span>
        <span>会えた回数 {sightings?.length ?? 0}回</span>
      </p>
      {cat.memo && <p className="cat-memo">{cat.memo}</p>}
      <div className="sighting-grid">
        {sightings?.map((sighting) => <SightingPhoto key={sighting.id} sighting={sighting} />)}
      </div>
    </div>
  );
}
