<script setup>
import crs from '@masterportal/masterportalapi/src/crs';
import { mdiCheckCircle } from '@mdi/js';
import axios from 'axios';
import { useTranslation } from 'i18next-vue';
import { intersects as olIntersects } from 'ol/extent';
import WMSCapabilities from 'ol/format/WMSCapabilities.js';
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  projectionCode: { type: String, default: 'EPSG:3857' },
  currentExtent: { type: Array, default: null },
  autoFocus: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

const { t } = useTranslation();

const emit = defineEmits([ 'selected', 'error' ]);

const inputRef = ref(null);
const wmsUrl = ref('');
const loading = ref(false);
const invalidUrl = ref(false);
const version = ref('');
const loaded = ref(false);

onMounted(() => {
  if (props.autoFocus && inputRef.value) inputRef.value.focus();
});

function isHttpUrl(url) {
  try {
    return new URL(url).protocol === 'http:';
  } catch {
    return false;
  }
}

function normalizeBaseUrl(raw) {
  const u = new URL(raw);
  u.searchParams.delete('request');
  u.searchParams.delete('service');
  u.searchParams.delete('version');
  return u.toString();
}

function buildCapabilitiesUrl(raw) {
  const base = new URL(normalizeBaseUrl(raw));
  base.searchParams.set('request', 'GetCapabilities');
  base.searchParams.set('service', 'WMS');
  return base.toString();
}

function isVersionEnabled(v) {
  if (!v) return false;
  const p = v.split('.').map((n) => parseInt(n, 10));
  if (p[0] < 1) return false;
  if (p[0] === 1 && (p[1] ?? 0) < 3) return false;
  return true;
}

function reversedDataForOldSpec(xml) {
  const xmlStr =
        typeof xml === 'string'
          ? xml
          : new XMLSerializer().serializeToString(xml);
  const patched = xmlStr
    .replace(/<SRS>/g, '<CRS>')
    .replace(/<\/SRS>/g, '</CRS>')
    .replace(/SRS=/g, 'CRS=');
  return new DOMParser().parseFromString(patched, 'text/xml');
}

function inCurrentExtent(capability, ext) {
  const current = ext || props.currentExtent;
  if (!Array.isArray(current) || current.length !== 4) return true;

  const bboxes = capability?.Capability?.Layer?.BoundingBox?.filter(
    (b) =>
      b?.crs &&
            b.crs.includes('EPSG') &&
            crs.getProjection(b.crs) &&
            Array.isArray(b.extent) &&
            b.extent.length === 4,
  );
  if (!bboxes?.length) return true;

  let first = [],
    second = [];

  for (const bb of bboxes) {
    if (bb.crs === props.projectionCode) {
      first = [ bb.extent[0], bb.extent[1] ];
      second = [ bb.extent[2], bb.extent[3] ];
      break;
    }
  }

  if (!first.length) {
    const src = bboxes[0];
    const epsg4326 = bboxes.find((b) => b.crs === 'EPSG:4326');
    if (epsg4326) {
      first = crs.transform(epsg4326.crs, props.projectionCode, [
        epsg4326.extent[1],
        epsg4326.extent[0],
      ]);
      second = crs.transform(epsg4326.crs, props.projectionCode, [
        epsg4326.extent[3],
        epsg4326.extent[2],
      ]);
    } else {
      first = crs.transform(src.crs, props.projectionCode, [
        src.extent[0],
        src.extent[1],
      ]);
      second = crs.transform(src.crs, props.projectionCode, [
        src.extent[2],
        src.extent[3],
      ]);
    }
  }

  const transformed = [ first[0], first[1], second[0], second[1] ];
  return olIntersects(current, transformed);
}

function safeLegendURL(obj) {
  try {
    return obj?.Style?.[0]?.LegendURL?.[0]?.OnlineResource?.toString();
  } catch {
    return undefined;
  }
}

function makeId(serviceUrl, layerName) {
  let host = 'wms';
  try {
    host = new URL(serviceUrl).host;
  } catch {}
  return `ext-wms:${host}:${layerName}`;
}

function collectStepSources(node, out, baseUrl, ver) {
  if (node?.Layer) {
    for (const child of node.Layer)
      collectStepSources(child, out, baseUrl, ver);
    return;
  }
  const name = node?.Name;
  const title = node?.Title;
  if (!name) return;

  out.push({
    id: makeId(baseUrl, String(name)),
    name: String(title ?? name),
    url: baseUrl,
    typ: 'WMS',
    layers:  [ String(name) ] ,
    version: ver,
    visibility: true,
    showInLayerTree: true,
    opacity: 1,
    zIndex: 200,
    legendURL: safeLegendURL(node),
    minScale: node?.MinScaleDenominator?.toString(),
    maxScale: node?.MaxScaleDenominator?.toString(),
  });
}

async function importLayers() {
  loaded.value = false;
  invalidUrl.value = false;
  const raw = wmsUrl.value.trim();

  if (!raw) {
    invalidUrl.value = true;
    emit('error', 'Please enter a WMS service URL.');
    return;
  }
  if (isHttpUrl(raw)) {
    emit('error', 'Only HTTPS WMS URLs are allowed.');
    return;
  }

  loading.value = true;
  try {
    const capUrl = buildCapabilitiesUrl(raw);
    const { data } = await axios({ url: capUrl, timeout: 8000 });

    const parser = new WMSCapabilities();
    let capability = parser.read(data);
    let ver = capability?.version;

    if (!isVersionEnabled(ver)) {
      const patched = reversedDataForOldSpec(data);
      capability = parser.read(patched);
      ver = capability?.version;
    }

    if (!inCurrentExtent(capability, props.currentExtent)) {
      emit(
        'error',
        'The service’s extent does not intersect the current map view.',
      );
      return;
    }

    version.value = ver || '';
    const baseUrl = normalizeBaseUrl(raw);

    const sources = [];
    const root = capability?.Capability?.Layer;
    if (root?.Layer && Array.isArray(root.Layer)) {
      for (const layer of root.Layer)
        collectStepSources(layer, sources, baseUrl, version.value);
    }

    if (!sources.length) {
      emit('error', 'No importable layers were found.');
      return;
    }

    emit('selected', sources);
    loaded.value = true;
  } catch (e) {
    emit(
      'error',
      'Failed to load WMS capabilities. The server might block CORS or the URL is invalid.',
    );
  } finally {
    loading.value = false;
  }
}

function onKeydown(e) {
  if (e.key === 'Enter') importLayers();
}

</script>

<template>
  <div class="add-wms my-4">
    <div
      v-if="invalidUrl"
      class="error"
    >
      Please enter a WMS service URL.
    </div>

    <div class="d-flex ga-2 align-center">
      <v-text-field
        ref="inputRef"
        v-model="wmsUrl"
        :placeholder="$t('additional:modules.dataNarrator.label.enterWms')"
        :disabled="loading || disabled"
        density="comfortable"
        variant="outlined"
        hide-details="auto"
        @keydown="onKeydown"
      >
        <template
          v-if="loaded"
          #prepend-inner
        >
          <v-icon
            :icon="mdiCheckCircle"
            color="black"
          />
        </template>
        <template #append-inner>
          <v-btn
            variant="outlined"
            density="comfortable"
            :loading="loading"
            :disabled="loading || !wmsUrl"
            @click="importLayers"
          >
            {{ t("additional:modules.dataNarrator.label.loadWmsBtn") }}
          </v-btn>
        </template>
      </v-text-field>
    </div>

    <div class="hint">
      {{ t("additional:modules.dataNarrator.label.wmsHint") }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.error {
    color: #b91c1c;
    font-size: 12px;
    margin-bottom: 6px;
}

.hint {
    font-size: 11px;
    opacity: 0.7;
    margin-top: 6px;
}
</style>
