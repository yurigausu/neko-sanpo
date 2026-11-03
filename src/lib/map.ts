import { GeoloniaMap } from '@geolonia/maps-core';
import '@geolonia/maps-core/css';
import { Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { LatLng } from '../types';
import { catIconSvg } from '../components/icons';

setWorkerUrl(workerUrl);

const GEOLONIA_API_KEY = import.meta.env.VITE_GEOLONIA_API_KEY as string | undefined;
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
const JAPAN_CENTER: [number, number] = [137.5, 36.5];
const JAPAN_ZOOM = 4;

/** Geoloniaのキーがあれば Geolonia Maps、なければ OpenFreeMap で地図を作る */
export function createMap(container: HTMLElement, center?: LatLng, zoom = 15): MapLibreMap {
  const view = {
    container,
    center: center ? ([center.lng, center.lat] as [number, number]) : JAPAN_CENTER,
    zoom: center ? zoom : JAPAN_ZOOM,
  };
  return GEOLONIA_API_KEY
    ? new GeoloniaMap({
        ...view,
        apiKey: GEOLONIA_API_KEY,
        lang: 'ja',
        marker: false,
        navigationControl: false,
        loader: false, // 読み込み前にmap.remove()すると、膜が残って地図を操作できなくなる
        gestureHandling: false, // 既定だとスマホで2本指でないと地図を動かせない
      })
    : new MapLibreMap({ ...view, style: STYLE_URL });
}

export function createCatPinElement() {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'cat-pin';
  el.setAttribute('aria-label', '猫の記録');
  el.innerHTML = catIconSvg;
  return el;
}
