import { useEffect, useRef } from 'react';
import Map, { Layer, Source, type MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Feature, LineString } from 'geojson';
import type { LayerSpecification } from 'maplibre-gl'

import { useRouteReadiness } from '../../hooks/useRouteReadiness';
import { COLOR_TOKENS } from '../../configs/theme';

const INITIAL_VIEW = {
  longitude: 78.9629,
  latitude: 20.5937,
  zoom: 4.5,
};

export const RadarMap = () => {
  const mapRef = useRef<MapRef | null>(null);

  const { data, error } = useRouteReadiness();

  useEffect(() => {
    if (!data?.routeGeometry || !mapRef.current) return;

    const routeGeo = data.routeGeometry as GeoJSON.LineString;

    const longitudes = routeGeo.coordinates.map(point => point[0]);
    const latitudes = routeGeo.coordinates.map(point => point[1]);

    const minLong = Math.min(...longitudes);
    const minLat = Math.min(...latitudes);
    const maxLong = Math.max(...longitudes);
    const maxLat = Math.max(...latitudes);

    mapRef.current.fitBounds([[minLong, minLat], [maxLong, maxLat]], { padding: 40 });

  }, [data?.routeGeometry]);

  const routeFeature: Feature<LineString> | null = data?.routeGeometry
    ? { type: 'Feature', geometry: data.routeGeometry as LineString, properties: {} }
    : null;

  const routeLayer: LayerSpecification = {
    id: 'route-line',
    type: 'line',
    source: 'route',
    paint: { 'line-color': COLOR_TOKENS.ACCENT, 'line-width': 4, 'line-opacity': 0.85 },
  };


  return (
    <Map
      ref={mapRef}
      initialViewState={INITIAL_VIEW}
      style={{ width: '100%', height: '100%' }}
      mapStyle={import.meta.env.VITE_MAP_STYLE_URL}
    >
      {data && (
        <>
          <Source id="route" type="geojson" data={routeFeature} />
          <Layer
            id="route-line"
            type="line"
            source="route"
            paint={{
              "line-color": COLOR_TOKENS.ACCENT,
              "line-width": 4
            }}
          />
        </>
      )}
    </Map>
  );
};
