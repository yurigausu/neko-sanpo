import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AddButton, TabBar } from './components/Navigation';
import AddPage from './pages/AddPage';
import CatDetailPage from './pages/CatDetailPage';
import CatEditPage from './pages/CatEditPage';
import GalleryPage from './pages/GalleryPage';
import MapPage from './pages/MapPage';

function TabLayout() {
  return (
    <div className="app">
      <main className="app-main">
        <Outlet />
        <AddButton />
      </main>
      <TabBar />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<TabLayout />}>
        {/* ホーム（P1）ができるまでは地図を初期画面にする */}
        <Route index element={<Navigate to="/map" replace />} />
        <Route path="map" element={<MapPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="cats/:id" element={<CatDetailPage />} />
      </Route>
      <Route path="add" element={<AddPage />} />
      <Route path="cats/:id/edit" element={<CatEditPage />} />
      <Route path="*" element={<Navigate to="/map" replace />} />
    </Routes>
  );
}
