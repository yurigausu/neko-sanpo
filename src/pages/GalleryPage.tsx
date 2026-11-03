import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { CatIcon } from '../components/icons';
import { SAKURA_MIMI_LABELS } from '../lib/format';
import { getCatSummaries, type CatSummary } from '../lib/queries';
import { useObjectUrl } from '../lib/useObjectUrl';

function CatCard({ summary }: { summary: CatSummary }) {
  const { cat, count, latest } = summary;
  const photoUrl = useObjectUrl(latest?.photo);

  return (
    <Link to={`/cats/${cat.id}`} className="cat-card">
      <div className="cat-card-photo">{photoUrl && <img src={photoUrl} alt="" />}</div>
      <div className="cat-card-body">
        <strong className="cat-card-name">{cat.name}</strong>
        <span>会えた回数 {count}回</span>
        <span className="sakura-label">{SAKURA_MIMI_LABELS[cat.sakuraMimi]}</span>
      </div>
    </Link>
  );
}

export default function GalleryPage() {
  const summaries = useLiveQuery(getCatSummaries);

  return (
    <div className="page">
      <h1 className="page-title">ギャラリー</h1>
      {summaries?.length === 0 && (
        <div className="empty">
          <CatIcon size={72} />
          <p>まだ猫がいません。<br />＋ボタンから記録しましょう。</p>
        </div>
      )}
      <div className="cat-grid">
        {summaries?.map((summary) => <CatCard key={summary.cat.id} summary={summary} />)}
      </div>
    </div>
  );
}
