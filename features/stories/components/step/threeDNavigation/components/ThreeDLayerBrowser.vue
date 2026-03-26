<script setup>
import { mdiTrashCan, mdiEye } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

import { use3DLayers } from '../../../../../../hooks/use3DLayers';
import TransparencySlider from '../../../step/layers/TransparencySlider.vue';

const store = useStore();
const { t } = useTranslation();
const { layers3D, loading } = use3DLayers();

const props = defineProps({
  modelValue: { type: Array, default: () => [] }
});
const emit = defineEmits([ 'update:modelValue' ]);

const transparencyDialog = ref(false);
const activeLayerId = ref(null);
const searchQuery = ref('');

// Available 3D layers not yet added
const availableLayers = computed(() => {
  const addedIds = new Set((props.modelValue ?? []).map(l => String(l.id)));
  return (layers3D.value ?? []).filter(l => !addedIds.has(String(l.id)));
});

const filteredAvailable = computed(() => {
  const q = searchQuery.value?.toLowerCase().trim();
  if (!q) return availableLayers.value;
  return availableLayers.value.filter(l => l.name?.toLowerCase().includes(q));
});

// Already added layers (resolved from modelValue)
const selectedLayers = computed(() => {
  const allById = new Map((layers3D.value ?? []).map(l => [ String(l.id), l ]));
  return (props.modelValue ?? [])
    .map(entry => {
      const layer = allById.get(String(entry.id));
      return layer ? { ...layer, transparency: entry.transparency ?? 0 } : null;
    })
    .filter(Boolean);
});

function addLayer(layer) {
  if (!layer?.id) return;
  if (!(props.modelValue ?? []).find(l => String(l.id) === String(layer.id))) {
    emit('update:modelValue', [ ...props.modelValue, { id: layer.id, transparency: 0 } ]);
    store.dispatch('addOrReplaceLayer', { layerId: layer.id, zIndex: 1, transparency: 0 });
  }
}

function removeLayer(id) {
  emit('update:modelValue', (props.modelValue ?? []).filter(l => String(l.id) !== String(id)));
  store.dispatch('Modules/LayerTree/removeLayer', { id });
  if (activeLayerId.value === id) activeLayerId.value = null;
}

function toggleTransparencySlider(layer) {
  transparencyDialog.value = !transparencyDialog.value;
  activeLayerId.value = activeLayerId.value === layer.id ? null : layer.id;
}

function onTransparencyChange(layer, transparency) {
  const opacity = 1 - transparency / 100;
  const mapLayer = store.getters['Maps/getLayerById'](layer.id);
  if (mapLayer) {
    mapLayer.setOpacity(opacity);
    mapLayer.changed();
  }
}

function onTransparencyFinalChange(layer, transparency) {
  store.dispatch('Modules/LayerTree/updateTransparency', {
    layerConf: layer,
    transparency
  });
  const item = props.modelValue.find(l => String(l.id) === String(layer.id));
  if (item) item.transparency = transparency;
}
</script>

<template>
  <!-- Added 3D layers -->
  <v-list
    v-if="selectedLayers.length"
    density="comfortable"
    class="pa-0 mb-2"
  >
    <v-list-item
      v-for="l in selectedLayers"
      :key="l.id"
      class="pa-0 mb-1"
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
                class="mr-2 cursor-pointer"
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

  <!-- 3D layer browser -->
  <div class="px-1">
    <div v-if="loading">
      <v-skeleton-loader type="paragraph" />
    </div>
    <template v-else>
      <v-text-field
        v-model="searchQuery"
        :label="t('additional:modules.dataNarrator.categoryBrowser.searchLayers')"
        variant="outlined"
        density="compact"
        clearable
        class="mb-2"
      />

      <div
        v-if="filteredAvailable.length === 0"
        class="text-body-2 text-medium-emphasis text-center py-4"
      >
        {{ layers3D.length === 0
          ? t('additional:modules.dataNarrator.categoryBrowser.noCategoriesAvailable')
          : t('additional:modules.dataNarrator.categoryBrowser.noResultsFound', { query: searchQuery }) }}
      </div>

      <button
        v-for="layer in filteredAvailable"
        :key="layer.id"
        class="layer-row"
        @click="addLayer(layer)"
      >
        <span class="layer-name">{{ layer.name }}</span>
        <span class="layer-type text-caption text-medium-emphasis">{{ layer.typ }}</span>
      </button>
    </template>
  </div>
</template>

<style scoped lang="scss">
.layer-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  background: transparent;
  border: 0;
  text-align: left;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: #f1f1f1;
  }

  .layer-name {
    flex: 1;
    font-size: 0.875rem;
  }
}
</style>

