import { useState } from 'react';
import { loadSampleData } from '../lib/sample';
import type { Sighting } from '../types';

export default function SampleButton({ onLoaded }: { onLoaded?: (sightings: Sighting[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleClick() {
    setBusy(true);
    setError('');
    try {
      const sightings = await loadSampleData();
      onLoaded?.(sightings);
    } catch {
      setError('読み込めませんでした。もう一度お試しください。');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sample-load">
      <button type="button" className="button secondary sample-button" disabled={busy} onClick={handleClick}>
        {busy ? '読み込み中…' : 'サンプルを読み込む'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
