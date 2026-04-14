<script setup>
import { mdiTrashCan, mdiEye } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';

import { useLayers } from '../../../../../hooks/useLayers';

import CategoryBrowser from './CategoryBrowser.vue';
import TransparencySlider from './TransparencySlider.vue';

const store = useStore();
const { layersTree, idToLayerMap, loading } = useLayers();
const { t } = useTranslation();

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  items: { type: Array, default: null },
  loadingValue: { type: Boolean, default: null },
  idToLayerMapValue: { type: Object, default: null }
});
const emit = defineEmits([ 'update:modelValue' ]);

const transparencyDialog = ref(false);
const activeLayerId = ref(null);
const resolvedItems = computed(() => props.items ?? layersTree.value);
const resolvedLoading = computed(() => props.loadingValue ?? loading.value);
const resolvedIdToLayerMap = computed(() => props.idToLayerMapValue ?? idToLayerMap.value);

const selectedLayers = computed(() =>
  (props.modelValue ?? [])
    .map(({ id }) => resolvedIdToLayerMap.value.get(String(id)))
    .filter(Boolean)
);

function addLayer(layerId) {
  if (!layerId) return;
  if (!props.modelValue.find(l => String(l.id) === String(layerId))) {
    emit('update:modelValue', [ ...props.modelValue, { id: layerId, transparency: 0 } ]);
  }
}

function removeLayer(id) {
  emit('update:modelValue', props.modelValue.filter(v => String(v.id) !== String(id)));
}

function toggleTransparencySlider(layer) {
  transparencyDialog.value = !transparencyDialog.value;
  activeLayerId.value = activeLayerId.value === layer.id ? null : layer.id;
}

function onTransparencyChange(layer, transparency) {
  layer.transparency = transparency;
  const opacity = 1 - (transparency / 100);
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
  const item = props.modelValue.find(item => String(item.id) === String(layer.id));
  if (item) item.transparency = transparency;
}

watch(
  () => props.modelValue,
  (newLayers = [], oldLayers = []) => {
    const prevIds = new Set(oldLayers.map(({ id }) => String(id)));
    const nextIds = new Set(newLayers.map(({ id }) => String(id)));
    const added = newLayers.filter(({ id }) => !prevIds.has(String(id)));
    const removed = oldLayers.filter(({ id }) => !nextIds.has(String(id)));

    const baseLayers = store.getters.layerConfigsByAttributes({
      baselayer: true,
      showInLayerTree: true
    });
    let maxBaselayerZIndex = Math.max(0, ...baseLayers.map(layer => layer.zIndex ?? 0));

    if (added.length) {
      for (const { id, transparency } of added) {
        store.dispatch('addOrReplaceLayer', {
          layerId: id,
          zIndex: ++maxBaselayerZIndex,
          transparency: transparency
        });
      }
    }

    for (const { id } of removed) {
      store.dispatch('Modules/LayerTree/removeLayer', { id });
    }
  },
  { immediate: true, deep: false }
);
</script>

<template>
  <!-- Added layers (compact) -->
  <v-list
    v-if="selectedLayers.length"
    density="comfortable"
    class="pa-0 mb-1 bg-transparent"
  >
    <v-list-item
      v-for="l in selectedLayers"
      :key="l.id"
      class="pa-0 mb-0"
    >
      <v-sheet
        width="100%"
        rounded
        class="d-flex align-center px-3 py-2 justify-space-between"
        style="border: 1px solid #e1e1e1"
      >
        <span class="flex-grow-1 text-body-2">{{ l.name }}</span>
        <div class="d-flex align-center">
          <v-tooltip location="top">
            <template #activator="{ props: actv }">
              <v-icon
                size="small"
                :icon="mdiEye"
                class="mr-2"
                v-bind="actv"
                @click="toggleTransparencySlider(l)"
              />
            </template>
            <span>{{ transparencyDialog
              ? t('additional:modules.dataNarrator.label.closeTransparencySlider')
              : t('additional:modules.dataNarrator.label.openTransparencySlider') }}
            </span>
          </v-tooltip>
          <v-icon
            size="small"
            :icon="mdiTrashCan"
            class="cursor-pointer"
            @click="removeLayer(l.id)"
          />
        </div>
      </v-sheet>
      <div
        v-if="activeLayerId === l.id"
        class="mt-1"
      >
        <TransparencySlider
          :initial-transparency="l.transparency"
          @update="onTransparencyChange(l, $event)"
          @final="onTransparencyFinalChange(l, $event)"
        />
      </div>
    </v-list-item>
  </v-list>

  <!-- CategoryBrowser always visible -->
  <CategoryBrowser
    :items="resolvedItems"
    :loading="resolvedLoading"
    :selected-ids="(props.modelValue ?? []).map(l => l.id)"
    @select:layer="(l) => addLayer(l.id)"
    @deselect:layer="(l) => removeLayer(l.id)"
  />
</template>

<style scoped lang="scss">
</style>
