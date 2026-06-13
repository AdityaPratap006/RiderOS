import { useRef } from 'react';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const INITIAL_VIEW = {
  longitude: 78.9629,
  latitude: 20.5937,
  zoom: 4.5,
};

export const RadarMap = () => {
  const mapRef = useRef<ReturnType<typeof Map> | null>(null);

  // placeholder — suppress unused warning until layers are wired
  void mapRef;

  return (
    <Map
      initialViewState={INITIAL_VIEW}
      style={{ width: '100%', height: '100%' }}
      mapStyle={import.meta.env.VITE_MAP_STYLE_URL}
    />
  );
};
