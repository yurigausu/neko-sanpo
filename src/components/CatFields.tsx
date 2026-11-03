import type { CatProfile, SakuraMimi } from '../types';

const SAKURA_OPTIONS: { value: SakuraMimi; label: string }[] = [
  { value: 'unknown', label: 'わからない' },
  { value: 'yes', label: 'あり' },
  { value: 'no', label: 'なし' },
];

interface Props {
  value: CatProfile;
  onChange: (value: CatProfile) => void;
}

export default function CatFields({ value, onChange }: Props) {
  return (
    <div className="new-cat-form">
      <label className="field">
        名前
        <input type="text" value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
      </label>
      <label className="field">
        猫のメモ
        <textarea rows={2} value={value.memo} onChange={(e) => onChange({ ...value, memo: e.target.value })} />
      </label>
      <fieldset className="field">
        <legend>さくら耳</legend>
        <div className="segmented">
          {SAKURA_OPTIONS.map((option) => (
            <label key={option.value} className={value.sakuraMimi === option.value ? 'selected' : ''}>
              <input
                type="radio"
                name="sakura"
                className="visually-hidden"
                checked={value.sakuraMimi === option.value}
                onChange={() => onChange({ ...value, sakuraMimi: option.value })}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
