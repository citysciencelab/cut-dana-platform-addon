<script setup>
import { mdiTrashCan, mdiClose, mdiFileDocumentOutline } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { ref, watch, nextTick, computed } from 'vue';
import { useStore } from 'vuex';

import AddWMS from '../../../../tools/addWms/components/AddWMS.vue';
import { addGeoJSON, clearGeoJSON } from '../../../../utils/geoJSON';
import { useNavigation } from '../../../steps/hooks/useNavigation';

import GeoJSONPanel from '../GeoJSON/GeoJSONPanel.vue';

import BackgroundMap from './step/BackgroundMap.vue';
import Layers from './step/layers/Layers.vue';
import StepDescription from './step/StepDescription.vue';
import StepTitle from './step/StepTitle.vue';
import ThreeDNavigation from './step/threeDNavigation/components/ThreeDNavigation.vue';
import TwoDNavigation from './step/TwoDNavigation.vue';

const props = defineProps({
  step: {
    type: Object,
    required: true
  },
  pillColor: {
    type: String,
    default: '#000000',
  }
});

const emit = defineEmits([ 'update:step', 'modelSelected' ]);

const { t } = useTranslation();
const { setBaseLayer, setAnimatedView } = useNavigation();
const store = useStore();

const stepTitleRef = ref(null);
const wmsDialogOpen = ref(false);
const allMapSources = ref([]);

function updateStep(updates) {
  emit('update:step', { ...props.step, ...updates });
}

function onWmsLoad(sources) {
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

const stepTitle = computed({
  get: () => props.step.title,
  set: (value) => updateStep({ title: value })
});

const stepDescription = computed({
  get: () => props.step.description,
  set: (value) => updateStep({ description: value })
});

const stepMapConfig = computed({
  get: () => props.step.mapConfig,
  set: (value) => updateStep({ mapConfig: value })
});

const backgroundMapId = computed({
  get: () => props.step.mapConfig?.backgroundMapId,
  set: (value) => updateStep({ mapConfig: { ...props.step.mapConfig, backgroundMapId: value } })
});

const informationLayerIds = computed({
  get: () => props.step.informationLayerIds,
  set: (value) => updateStep({ informationLayerIds: value })
});

const is3D = computed({
  get: () => props.step.is3D,
  set: (value) => updateStep({ is3D: value })
});

const navigation3D = computed({
  get: () => props.step.navigation3D,
  set: (value) => updateStep({ navigation3D: value })
});

watch(
  () => props.step.is3D,
  (is3DEnabled) => {
    store.dispatch('Maps/changeMapMode', is3DEnabled ? '3D' : '2D');
  },
  { immediate: true }
);

watch(
  () => props.step?.id,
  async () => {
    await nextTick();
    stepTitleRef.value?.focus?.();
  }
);

watch(
  () => props.step?.mapConfig,
  (newMapConfig) => {
    setBaseLayer(newMapConfig?.backgroundMapId);
    setAnimatedView({
      center: newMapConfig.centerCoordinates,
      zoom: newMapConfig.zoomLevel
    });
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

</script>

<template>
  <div class="chapter-step px-2 pt-1 pb-2">
    <v-row class="mb-2">
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
        />
      </v-col>
    </v-row>

    <v-row class="mb-2">
      <v-col
        cols="12"
        class="p-0"
      >
        <StepDescription v-model:value="stepDescription" />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        class="p-0"
      >
        {{ t("additional:modules.dataNarrator.label.mapDisplay") }}
      </v-col>
    </v-row>

    <TwoDNavigation v-model="stepMapConfig" />

    <v-row class="mb-2">
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

    <v-row class="mb-1">
      <v-col
        cols="12"
        class="p-0"
      >
        Informationsebenen
      </v-col>
    </v-row>

    <Layers v-model="informationLayerIds" />

    <v-row class="mb-1">
      <v-col
        cols="12"
        class="p-0"
      >
        {{ t("additional:modules.dataNarrator.label.wmsLayer") }}
      </v-col>
    </v-row>

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
                      :icon="mdiFileDocumentOutline"
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
        v-for="l in step.mapSources"
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
          <v-icon
            :icon="mdiTrashCan"
            class="cursor-pointer"
            @click="removeWmsLayer(l.id)"
          />
        </v-sheet>
      </v-list-item>
    </v-list>

    <GeoJSONPanel
      :model-value="step.geoJsonAssets"
      @update:model-value="(value) => updateStep({ geoJsonAssets: value })"
    />

    <div
      v-if="step.mapSources?.length === 0"
      class="text-medium-emphasis py-2"
    >
      {{ t("additional:modules.dataNarrator.label.noWmsLayer") }}
    </div>

    <div>
      <div class="mb-2">
        3D Navigation
      </div>

      <div class="mb-2">
        <v-switch
          v-model="is3D"
          hide-details
          inset
          label="Enable 3D for this step"
        />
      </div>
    </div>

    <ThreeDNavigation
      v-if="step.is3D"
      v-model="navigation3D"
      @model-selected="(file) => emit('modelSelected', { step, file })"
    />
  </div>
</template>
