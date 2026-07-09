import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Circle, Fill, Stroke, Style } from 'ol/style.js';

// Style function to extract and use styling from GeoJSON features
function geoJSONStyleFunction(feature) {
  // Try to get style from feature properties (e.g., from GeoJSON with styling)
  const style = feature.getStyle();
  if (style) {
    return style;
  }

  // Check for masterportal_attributes with drawState (from draw tool)
  const masterportalAttributes = feature.get('masterportal_attributes');
  if (masterportalAttributes?.drawState) {
    const drawState = masterportalAttributes.drawState;
    const geometryType = feature.getGeometry()?.getType();

    // Point styling
    if (geometryType === 'Point' || geometryType === 'MultiPoint') {
      if (drawState.text) {
        return new Style({
          image: new Circle({
            fill: new Fill({ color: drawState.color || 'rgba(226,26,28,0.9)' }),
            radius: drawState.pointSize ? drawState.pointSize / 2 : 8
          }),
          text: new Style({
            text: drawState.text,
            font: `${drawState.fontSize || 16}px Arial,sans-serif`,
            fill: new Fill({ color: drawState.color || 'rgba(226,26,28,0.9)' })
          })
        });
      }
      return new Style({
        image: new Circle({
          fill: new Fill({ color: drawState.color || 'rgba(226,26,28,0.9)' }),
          radius: drawState.pointSize ? drawState.pointSize / 2 : 8
        })
      });
    }

    // Line styling
    if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
      return new Style({
        stroke: new Stroke({
          color: drawState.colorContour || 'rgba(226,26,28,0.9)',
          width: drawState.strokeWidth || 2
        })
      });
    }

    // Polygon styling
    if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
      return new Style({
        stroke: new Stroke({
          color: drawState.colorContour || 'rgba(226,26,28,0.9)',
          width: drawState.strokeWidth || 2
        }),
        fill: new Fill({
          color: drawState.color || 'rgba(228,26,28,0.5)'
        })
      });
    }
  }

  // Check for attribute-based styling (custom styles)
  const customStyles = window.__dataNarratorCustomStyles;
  if (customStyles && !masterportalAttributes?.drawState) {
    const layerName = feature.get('source');
    const assetStyles = customStyles[layerName];
    if (assetStyles && assetStyles.length > 0) {
      const geometryType = feature.getGeometry()?.getType();
      const featureAttribute = feature.get(assetStyles[0].attribute);
      const featureColor = assetStyles.find(a =>
        a.attributeValue === featureAttribute || a.attributeValue === 'none'
      )?.attributeColor || 'rgba(226,26,28,0.9)';

      if (geometryType === 'Point' || geometryType === 'MultiPoint') {
        return new Style({
          image: new Circle({
            fill: new Fill({ color: featureColor }),
            radius: 8
          })
        });
      }
      if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
        return new Style({
          stroke: new Stroke({
            color: featureColor,
            width: 2
          })
        });
      }
      if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
        return new Style({
          stroke: new Stroke({
            color: 'rgba(169,159,163,0.9)',
            width: 2
          }),
          fill: new Fill({ color: featureColor })
        });
      }
    }
  }

  // Fallback style if no styling found
  const defaultFill = new Fill({
    color: 'rgba(163,196,255,0.5)',
  });
  const defaultStroke = new Stroke({
    color: 'rgb(70, 81, 102)',
    width: 2,
  });
  const geometryType = feature.getGeometry()?.getType();
  if (geometryType === 'Point' || geometryType === 'MultiPoint') {
    return new Style({
      image: new Circle({
        fill: defaultFill,
        stroke: defaultStroke,
        radius: 8,
      })
    });
  }
  if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
    return new Style({
      stroke: defaultStroke
    });
  }
  if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
    return new Style({
      stroke: defaultStroke,
      fill: defaultFill
    });
  }
  return new Style();
}

function createGeoJSONLayer() {
  const layer = new VectorLayer({
    source: new VectorSource(),
    style: geoJSONStyleFunction
  });
  layer.set('name', 'data-narrator-geojson');
  layer.set('id', 'data-narrator-geojson');
  layer.set('gfiAttributes', 'showAll');
  return layer;
}

export function getGeoJSONLayer() {
  //TODO: add support for 3D map
  const map = mapCollection?.getMap('2D');
  if (!map) return null;
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
  layer?.getSource()?.clear();
}

export function addGeoJSON(geoJSONAssets) {
  //TODO: add support for 3D map
  const map = mapCollection?.getMap('2D');
  if (!map) return;
  const mapProjection = map.getView().getProjection().getCode();
  const parser = new GeoJSON({ extractStyles: true });
  let transparency = 0;
  const layer = getGeoJSONLayer();
  const source = layer.getSource();
  geoJSONAssets?.forEach(asset => {
    const features = parser.readFeatures(asset.geoJson, {
      dataProjection: asset.crs || 'EPSG:4326',
      featureProjection: mapProjection,
    });
    source.addFeatures(features);
    transparency = asset.transparency ?? transparency;
  });
  updateGeoJSONZIndex();
  const opacity = 1 - (transparency / 100);
  layer.setOpacity(opacity);
  layer.changed();
}

export function updateGeoJSONZIndex() {
  const layer = getGeoJSONLayer();
  if (!layer) return;
  const map = mapCollection?.getMap('2D');
  if (!map) return;
  const layers = map.getLayers().getArray();
  const maxZIndex = Math.max(...layers.map(l => l.getZIndex() || 0));
  layer.setZIndex(maxZIndex + 1);
}
