import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Circle, Fill, Stroke, Style } from 'ol/style.js';

function createGeoJSONLayer() {
  // Colors from design concept of Data Narrator
  const fill = new Fill({
    color: 'rgba(163,196,255,0.7)',
  });
  const stroke = new Stroke({
    color: 'rgb(70, 81, 102)',
    width: 2,
  });
  const style = new Style({
    image: new Circle({
      fill: fill,
      stroke: stroke,
      radius: 8,
    }),
    fill: fill,
    stroke: stroke,
  });

  const layer = new VectorLayer({
    source: new VectorSource(),
    style
  });
  layer.set('name', 'data-narrator-geojson');
  return layer;
};

function getGeoJSONLayer() {
  //TODO: add support for 3D map
  const map = mapCollection.getMap('2D');
  const layers = map.getLayers();
  let layer = layers.getArray().find(l => l.get('name') === 'data-narrator-geojson');
  if (!layer) {
    layer = createGeoJSONLayer();
    map.addLayer(layer);
  }
  return layer;
}

export function clearGeoJSON() {
  const layer = getGeoJSONLayer();
  layer.getSource().clear();
}

export function addGeoJSON(geoJSONAssets) {
  //TODO: add support for 3D map
  const map = mapCollection.getMap('2D');
  const mapProjection = map.getView().getProjection().getCode();
  const parser = new GeoJSON();
  const layer = getGeoJSONLayer();
  const source = layer.getSource();
  geoJSONAssets?.forEach(asset => {
    const features = parser.readFeatures(asset.geoJson, {
      dataProjection: asset.crs || 'EPSG:4326',
      featureProjection: mapProjection,
    });
    source.addFeatures(features);
  });
  updateGeoJSONZIndex();
};

export function updateGeoJSONZIndex() {
  const layer = getGeoJSONLayer();
  const map = mapCollection.getMap('2D');
  const layers = map.getLayers().getArray();
  const maxZIndex = Math.max(...layers.map(l => l.getZIndex() || 0));
  layer.setZIndex(maxZIndex + 1);
}
