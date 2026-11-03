import { Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { LatLng } from '../types';
import { catIconSvg } from '../components/icons';

setWorkerUrl(workerUrl);

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
const JAPAN_CENTER: [number, number] = [137.5, 36.5];
const JAPAN_ZOOM = 4;

export function createMap(container: HTMLElement, center?: LatLng, zoom = 15) {
  return new MapLibreMap({
    container,
    style: STYLE_URL,
    center: center ? [center.lng, center.lat] : JAPAN_CENTER,
    zoom: center ? zoom : JAPAN_ZOOM,
  });
}

export function createCatPinElement() {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'cat-pin';
  el.setAttribute('aria-label', '猫の記録');
  el.innerHTML = catIconSvg;
  return el;
}
