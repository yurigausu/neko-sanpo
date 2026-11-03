import { useEffect, useRef, useState } from 'react';
import { Marker, type Map as MapLibreMap } from 'maplibre-gl';
import { createCatPinElement, createMap } from '../lib/map';
import type { LatLng } from '../types';

interface Props {
  value: LatLng | null;
  onChange: (value: LatLng) => void;
  /** 位置が未定のときに最初に見せる場所 */
  fallbackCenter?: LatLng;
}

export default function LocationPicker({ value, onChange, fallbackCenter }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const initialCenter = useRef(value ?? fallbackCenter);

  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const map = createMap(containerRef.current!, initialCenter.current);
    map.on('click', (e) => onChangeRef.current({ lat: e.lngLat.lat, lng: e.lngLat.lng }));
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !value) return;
    if (!markerRef.current) {
      markerRef.current = new Marker({ element: createCatPinElement(), anchor: 'bottom' });
      markerRef.current.setLngLat(value).addTo(map);
    } else {
      markerRef.current.setLngLat(value);
    }
  }, [value]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('この端末では現在地を取得できません。地図をタップしてください。');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        const location = { lat: coords.latitude, lng: coords.longitude };
        onChange(location);
        mapRef.current?.flyTo({ center: location, zoom: 16 });
      },
      () => {
        setLocating(false);
        setError('現在地を取得できませんでした。地図をタップしてください。');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="location-picker">
      <div ref={containerRef} className="location-picker-map" data-testid="location-map" />
      <button type="button" className="button secondary" onClick={useCurrentLocation} disabled={locating}>
        {locating ? '現在地を取得中…' : '現在地を使う'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
