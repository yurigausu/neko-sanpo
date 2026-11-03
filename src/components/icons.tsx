const CAT_PATHS = `
  <path fill="#e8924f" d="M4 3.5 8.6 7a10 10 0 0 1 6.8 0L20 3.5c.5-.4 1 0 1 .5v9a9 8 0 0 1-18 0V4c0-.5.5-.9 1-.5Z"/>
  <circle cx="8.5" cy="12.5" r="1.3" fill="#4a3428"/>
  <circle cx="15.5" cy="12.5" r="1.3" fill="#4a3428"/>
  <path fill="#4a3428" d="M10.8 15h2.4l-1.2 1.3Z"/>
`;

// 地図のピンはDOMで作るので文字列でも持つ
export const catIconSvg = `<svg viewBox="0 0 24 24" aria-hidden="true">${CAT_PATHS}</svg>`;

export function CatIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: CAT_PATHS }}
    />
  );
}

export function MapTabIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function GalleryTabIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="2" />
      <rect x="13" y="4" width="7" height="7" rx="2" />
      <rect x="4" y="13" width="7" height="7" rx="2" />
      <rect x="13" y="13" width="7" height="7" rx="2" />
    </svg>
  );
}
