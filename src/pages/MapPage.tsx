import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { GeolocateControl, LngLatBounds, Marker, Popup, type Map as MapLibreMap } from 'maplibre-gl';
import SampleButton from '../components/SampleButton';
import { db } from '../db';
import { formatDate } from '../lib/format';
import { createCatPinElement, createMap } from '../lib/map';
import type { Cat, Sighting } from '../types';

function createPopupContent(cat: Cat | undefined, sighting: Sighting, onOpenCat: (id: string) => void) {
  const root = document.createElement('button');
  root.type = 'button';
  root.className = 'pin-popup';
  root.onclick = () => onOpenCat(sighting.catId);

  const img = document.createElement('img');
  img.alt = cat?.name ?? '';
  img.src = URL.createObjectURL(sighting.photo);
  img.onload = () => URL.revokeObjectURL(img.src);

  const name = document.createElement('strong');
  name.textContent = cat?.name ?? '';
  const date = document.createElement('span');
  date.textContent = formatDate(sighting.takenAt);

  root.append(img, name, date);
  return root;
}

function fitToSightings(map: MapLibreMap, sightings: Sighting[]) {
  const bounds = new LngLatBounds();
  sightings.forEach((s) => bounds.extend([s.lng, s.lat]));
  map.fitBounds(bounds, { padding: 70, maxZoom: 16, duration: 0 });
}

export default function MapPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const hasFitted = useRef(false);

  const data = useLiveQuery(async () => {
    const [cats, sightings] = await Promise.all([db.cats.toArray(), db.sightings.toArray()]);
    return { cats, sightings };
  });

  useEffect(() => {
    const map = createMap(containerRef.current!);
    map.addControl(
      new GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }),
      'top-right',
    );
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      hasFitted.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !data) return;

    const catsById = new Map(data.cats.map((cat) => [cat.id, cat]));
    const markers = data.sightings.map((sighting) => {
      const popup = new Popup({ offset: 40, closeButton: false, maxWidth: '220px' });
      // 写真のURLは開いたときだけ作る
      popup.on('open', () => {
        popup.setDOMContent(
          createPopupContent(catsById.get(sighting.catId), sighting, (id) => navigate(`/cats/${id}`)),
        );
      });
      return new Marker({ element: createCatPinElement(), anchor: 'bottom' })
        .setLngLat([sighting.lng, sighting.lat])
        .setPopup(popup)
        .addTo(map);
    });

    if (!hasFitted.current && data.sightings.length > 0) {
      hasFitted.current = true;
      fitToSightings(map, data.sightings);
    }

    return () => markers.forEach((marker) => marker.remove());
  }, [data, navigate]);

  return (
    <div className="map-page">
      <div ref={containerRef} className="map-page-map" data-testid="main-map" />
      <div className="map-overlay">
        {data?.sightings.length === 0 && (
          <p className="map-hint">＋ボタンから、出会った猫を記録しましょう</p>
        )}
        <SampleButton
          onLoaded={(sightings) => {
            // 実データが別の場所にあっても、サンプルが見えるようにする
            hasFitted.current = true;
            if (mapRef.current) fitToSightings(mapRef.current, sightings);
          }}
        />
      </div>
    </div>
  );
}
