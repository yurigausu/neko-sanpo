import { Link, NavLink, useLocation } from 'react-router-dom';
import { GalleryTabIcon, MapTabIcon } from './icons';

export function TabBar() {
  // 猫の詳細はギャラリーの続きとして扱う
  const { pathname } = useLocation();
  const inGallery = pathname.startsWith('/cats/');

  return (
    <nav className="tab-bar" aria-label="メインメニュー">
      <NavLink to="/map" className="tab">
        <MapTabIcon />
        地図
      </NavLink>
      <NavLink to="/gallery" className={({ isActive }) => (isActive || inGallery ? 'tab active' : 'tab')}>
        <GalleryTabIcon />
        ギャラリー
      </NavLink>
    </nav>
  );
}

export function AddButton() {
  return (
    <Link to="/add" className="add-button" aria-label="記録を追加">
      ＋
    </Link>
  );
}
