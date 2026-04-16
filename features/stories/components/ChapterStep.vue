<script setup>
import {
  mdiChevronRight,
  mdiClose,
  mdiCubeScan,
  mdiEye,
  mdiFileDocumentPlusOutline,
  mdiMapMarkerPlusOutline,
  mdiTrashCan
} from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';

import { useNavigation } from '../../../hooks/useNavigation';
import { useSceneReset } from '../../../hooks/useSceneReset';
import AddWMS from '../../../tools/addWms/components/AddWMS.vue';
import { addGeoJSON, clearGeoJSON } from '../../../utils/geoJSON';

import BackgroundMap from './step/BackgroundMap.vue';
import TransparencySlider from './step/layers/TransparencySlider.vue';
import StepDescription from './step/StepDescription.vue';
import StepTitle from './step/StepTitle.vue';
import TwoDNavigation from './step/TwoDNavigation.vue';

const props = defineProps({
  step: {
    type: Object,
    required: true
  },
  chapterTitle: {
    type: String,
    default: ''
  },
  pillColor: {
    type: String,
    default: '#000000',
  },
  showValidation: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([ 'update:step', 'open3D', 'open3DLayers', 'openLayers', 'openGeoJSON', 'focus-chapter-title' ]);

const { t } = useTranslation();
const { setAnimatedView, setBaseLayer, setInformationLayers } = useNavigation();
const { resetScene } = useSceneReset();
const store = useStore();

const transparencyDialog = ref(false);
const activeLayerId = ref(null);
const stepTitleRef = ref(null);
const stepDescriptionRef = ref(null);
const lastNavigatedStepId = ref(null);
const wmsDialogOpen = ref(false);
const allMapSources = ref([]);

defineExpose({
  async focusStepTitle() {
    await nextTick();
    stepTitleRef.value?.focus?.();
  }
});

const updateStep = (updates) => emit('update:step', { ...props.step, ...updates });

const onWmsLoad = (sources) => {
  const mapSources = Array.isArray(props.step.mapSources) ? props.step.mapSources : [];
  updateStep({ mapSources });
  allMapSources.value = [];

  const existing = new Set(allMapSources.value.map((s) => s.id));
  for (const src of sources) {
    if (!existing.has(src.id)) {
      src.showInLayerTree = false;
      allMapSources.value.push(src);
    }
  }
  wmsDialogOpen.value = true;
}

function loadWmsLayer(layer) {
  const mapSources = [ ...(props.step.mapSources || []), layer ];
  updateStep({ mapSources });
  store.dispatch('addLayerToLayerConfig', {
    layerConfig: layer,
    parentKey: 'subjectlayer',
  });
}

function removeWmsLayer(id) {
  const mapSources = props.step.mapSources.filter((v) => v.id !== id);
  updateStep({ mapSources });
  store.dispatch('Modules/LayerTree/removeLayer', { id });
}

function toggleTransparencySlider(layer) {
  transparencyDialog.value = !transparencyDialog.value;
  activeLayerId.value = activeLayerId.value === layer.id ? null : layer.id;
}

function onTransparencyChange(layer, transparency) {
  layer.transparency = transparency;
  const opacity = 1 - (transparency / 100);
  layer.opacity = opacity;
  const mapLayer = store.getters['Maps/getLayerById'](layer.id);
  if (mapLayer) {
    mapLayer.setOpacity(opacity);
    mapLayer.changed();
  }
}

function onTransparencyFinalChange(layer, transparency) {
  store.dispatch('Modules/LayerTree/updateTransparency', {
    layerConf: layer,
    transparency: transparency
  });
}

const stepTitle = computed({
  get: () => props.step.title,
  set: (value) => updateStep({ title: value })
});

const stepDescription = computed({
  get: () => props.step.description,
  set: (value) => updateStep({ description: value })
});

function hasTextContent(value) {
  const str = String(value ?? '').trim();
  if (!str) return false;
  const doc = new DOMParser().parseFromString(str, 'text/html');
  return (doc.body.textContent?.replace(/\s+/g, ' ').trim() ?? '').length > 0;
}

const stepTitleError = computed(() => props.showValidation && !props.step.title?.trim());
const stepDescriptionError = computed(() => props.showValidation && !hasTextContent(props.step.description));

const stepMapConfig = computed({
  get: () => props.step.mapConfig,
  set: (value) => updateStep({ mapConfig: value })
});

const backgroundMapId = computed({
  get: () => props.step.mapConfig?.backgroundMapId,
  set: (value) => updateStep({ mapConfig: { ...props.step.mapConfig, backgroundMapId: value } })
});

const is3D = computed({
  get: () => props.step.is3D,
  set: (value) => updateStep({ is3D: value })
});

const mapSources = computed({
  get: () => props.step.mapSources
});

watch(
  () => props.step.is3D,
  (is3DEnabled, oldVal) => {
    // Skip initial mount when step was never 3D — no cleanup needed
    if (oldVal === undefined && !is3DEnabled) return;

    if (!is3DEnabled) {
      resetScene();
    } else {
      store.dispatch('Maps/changeMapMode', '3D');
    }
  },
  { immediate: true }
);

const focusAppropriateField = async () => {
  await nextTick();
  await nextTick(); // ensure parent refs are resolved after v-if mount
  if (!props.chapterTitle) {
    emit('focus-chapter-title');
  } else {
    stepTitleRef.value?.focus?.();
  }
};

onMounted(focusAppropriateField);

watch(
  () => props.step?.id,
  focusAppropriateField
);

watch(
  () => props.step?.mapConfig,
  (newMapConfig) => {
    setBaseLayer(newMapConfig?.backgroundMapId);

    // Only navigate when switching to a different step, not when user edits the current step's mapConfig
    const stepId = props.step?.id;
    if (lastNavigatedStepId.value === stepId) return;
    lastNavigatedStepId.value = stepId;

    const center = Array.isArray(newMapConfig?.centerCoordinates)
      ? newMapConfig.centerCoordinates.map(Number)
      : [];
    const zoom = Number(newMapConfig?.zoomLevel);

    if (center.length >= 2 && Number.isFinite(zoom)) {
      setAnimatedView({
        center,
        zoom
      });
    }
  },
  { immediate: true, deep: true }
);

watch(
  [
    () => props.step?.informationLayers,
    () => props.step?.mapSources,
    () => props.step?.mapConfig?.backgroundMapId
  ],
  ([ informationLayers, mapSources, backgroundMapId ]) => {
    const activeLayers = [
      ...(Array.isArray(informationLayers) ? informationLayers : []),
      ...(Array.isArray(mapSources) ? mapSources : []),
    ];

    setInformationLayers(
      activeLayers,
      [ String(backgroundMapId ?? ''), '19969' ].filter(Boolean)
    );
  },
  { immediate: true, deep: true }
);

watch(
  () => props.step?.geoJsonAssets,
  (newGeoJsonAssets) => {
    clearGeoJSON();
    addGeoJSON(newGeoJsonAssets);
  },
  { immediate: true, deep: true }
);

// load existing WMS layers into layer config on mount
onMounted(() => {
  if (mapSources.value.length > 0) {
    for (const layer of mapSources.value) {
      store.dispatch('addLayerToLayerConfig', {
        layerConfig: layer,
        parentKey: 'subjectlayer',
      });
    }
  }
});
</script>

<template>
  <div class="chapter-step px-2 pt-1 pb-2">
    <div class="mb-2">
      <v-row>
        <v-col
          cols="1"
          class="p-0"
        >
          <v-btn
            variant="text"
            class="pill-button"
          >
            {{ step.id }}
          </v-btn>
        </v-col>

        <v-col
          cols="11"
          class="p-0"
        >
          <StepTitle
            ref="stepTitleRef"
            v-model:value="stepTitle"
            :error="stepTitleError"
            @tab="stepDescriptionRef?.focus()"
          />
        </v-col>
      </v-row>
    </div>

    <div class="mb-2">
      <v-row>
        <v-col
          cols="12"
          class="p-0"
        >
          <StepDescription
            ref="stepDescriptionRef"
            v-model:value="stepDescription"
            :error="stepDescriptionError"
          />
        </v-col>
      </v-row>
    </div>

    <v-row>
      <v-col
        cols="12"
        class="p-0"
      >
        {{ t("additional:modules.dataNarrator.label.mapDisplay") }}
      </v-col>
    </v-row>

    <TwoDNavigation v-model="stepMapConfig" />

    <div class="mb-2">
      <v-row>
        <v-col
          cols="12"
          class="p-0"
        >
          <BackgroundMap
            v-model="backgroundMapId"
            @update:model-value="setBaseLayer"
          />
        </v-col>
      </v-row>
    </div>

    <div class="mb-2 d-flex justify-center">
      <v-btn
        variant="flat"
        size="small"
        class="layers-btn"
        :prepend-icon="mdiMapMarkerPlusOutline"
        :append-icon="mdiChevronRight"
        rounded
        @click="emit('openLayers')"
      >
        {{
          step.informationLayers?.length
            ? t('additional:modules.dataNarrator.layer.editInformationLayer')
            : t('additional:modules.dataNarrator.layer.addInformationLayer')
        }}
      </v-btn>
    </div>

    <div class="mb-1">
      <v-row>
        <v-col
          cols="12"
          class="p-0"
        >
          {{ t("additional:modules.dataNarrator.label.wmsLayer") }}
        </v-col>
      </v-row>
    </div>

    <AddWMS
      @selected="onWmsLoad"
      @error="(msg) => console.error(msg)"
    />

    <v-dialog
      v-model="wmsDialogOpen"
      max-width="480"
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          {{ t("additional:modules.dataNarrator.label.wmsLayer") }}
          <v-spacer />
          <v-btn
            icon
            variant="text"
            @click="wmsDialogOpen = false"
          >
            <v-icon :icon="mdiClose" />
          </v-btn>
        </v-card-title>
        <v-card-subtitle class="d-flex align-left">
          {{ t("additional:modules.dataNarrator.label.selectWmsLayer") }}
        </v-card-subtitle>
        <v-list
          density="comfortable"
          class="pa-0"
        >
          <v-list-item
            v-for="l in allMapSources"
            :key="l.id"
            class="pa-0"
          >
            <v-sheet
              width="100%"
              rounded
              class="d-flex align-center px-3 py-2"
            >
              <span>
                <v-tooltip location="top">
                  <template #activator="{ props: actv }">
                    <v-icon
                      :icon="mdiFileDocumentPlusOutline"
                      class="mr-2"
                      v-bind="actv"
                      @click="loadWmsLayer(l)"
                    />
                  </template>
                  <span>
                    {{ t("additional:modules.dataNarrator.label.loadWmsLayer") }}
                  </span>
                </v-tooltip>
                <span class="grow">{{ l.name }}</span>
              </span>
            </v-sheet>
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <v-list
      density="comfortable"
      class="pa-0"
    >
      <v-list-item
        v-for="l in mapSources"
        :key="l.id"
        class="pa-0"
      >
        <v-sheet
          width="100%"
          rounded
          class="d-flex align-center px-3 py-2"
          style="border: 1px solid #e1e1e1"
        >
          <span class="flex-grow-1">{{ l.name }}</span>
          <div class="d-flex align-center">
            <v-tooltip location="top">
              <template #activator="{ props: actv }">
                <v-icon
                  :icon="mdiEye"
                  class="mr-2"
                  v-bind="actv"
                  @click="toggleTransparencySlider(l)"
                />
              </template>
              <span>{{
                transparencyDialog ?
                  t("additional:modules.dataNarrator.label.closeTransparencySlider") :
                  t("additional:modules.dataNarrator.label.openTransparencySlider")
              }}
              </span>
            </v-tooltip>
            <v-icon
              :icon="mdiTrashCan"
              class="cursor-pointer"
              @click="removeWmsLayer(l.id)"
            />
          </div>
        </v-sheet>
        <div
          v-if="activeLayerId === l.id"
          class="mt-2"
        >
          <TransparencySlider
            :initial-transparency="l.transparency"
            @update="onTransparencyChange(l, $event)"
            @final="onTransparencyFinalChange(l, $event)"
          />
        </div>
      </v-list-item>
    </v-list>

    <div class="mb-2 d-flex justify-center">
      <v-btn
        variant="flat"
        size="small"
        class="geojson-btn"
        :prepend-icon="mdiMapMarkerPlusOutline"
        :append-icon="mdiChevronRight"
        rounded
        @click="emit('openGeoJSON')"
      >
        {{
          step.geoJsonAssets?.length
            ? t('additional:modules.dataNarrator.geojson.editGeoJSON')
            : t('additional:modules.dataNarrator.geojson.addGeoJSON')
        }}
      </v-btn>
    </div>

    <div class="is3d-toggle-row my-2">
      <span class="is3d-toggle-label text-body-2">
        {{ t('additional:modules.dataNarrator.label.is3D') }}
      </span>
      <v-switch
        class="is3d-toggle-switch"
        :model-value="is3D"
        hide-details
        density="compact"
        @update:model-value="is3D = $event"
      />
    </div>

    <div
      v-if="is3D"
      class="mb-2 mt-1 d-flex justify-center"
    >
      <v-btn
        variant="flat"
        size="small"
        class="threed-btn"
        :prepend-icon="mdiCubeScan"
        :append-icon="mdiChevronRight"
        rounded
        @click="emit('open3D')"
      >
        {{
          step.models3D?.length
            ? t('additional:modules.dataNarrator.label.editThreeDFiles')
            : t('additional:modules.dataNarrator.label.threeDFiles')
        }}
      </v-btn>
    </div>

    <div
      v-if="is3D"
      class="mb-2 d-flex justify-center"
    >
      <v-btn
        variant="flat"
        size="small"
        class="threed-btn"
        :prepend-icon="mdiMapMarkerPlusOutline"
        :append-icon="mdiChevronRight"
        rounded
        @click="emit('open3DLayers')"
      >
        {{
          step.layers3D?.length
            ? t('additional:modules.dataNarrator.label.editLayers3D')
            : t('additional:modules.dataNarrator.label.addLayers3D')
        }}
      </v-btn>
    </div>
  </div>
</template>

<style scoped lang="scss">
.threed-btn, .layers-btn, .geojson-btn {
  background-color: #ffffff;
  color: #1f2937;
  border: 1px solid rgba(31, 41, 55, 0.2);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
  font-weight: 600;
  letter-spacing: 0.1px;
  width: 300px;
}

.threed-btn:hover, .layers-btn:hover, .geojson-btn:hover {
  background-color: #f8fafc;
  border-color: rgba(31, 41, 55, 0.35);
}

.is3d-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.is3d-toggle-label {
  flex: 1;
}

.is3d-toggle-switch {
  margin-left: 8px;
}

.is3d-toggle-switch:deep(.v-selection-control) {
  min-height: 28px;
}

.is3d-toggle-switch:deep(.v-selection-control__wrapper) {
  width: 34px;
  height: 20px;
}
</style>
