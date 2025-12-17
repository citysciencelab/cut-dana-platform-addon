<script setup>
import { mdiChevronRight, mdiEye, mdiMapMarkerPlusOutline, mdiTrashCan, mdiClose } from '@mdi/js';
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';

import { useLayers } from '../../../../../../hooks/useLayers';

import CategoryBrowser from './CategoryBrowser.vue';

const store = useStore();
const { layersTree, idToLayerMap, loading } = useLayers();

const props = defineProps({ modelValue: { type: Array, default: () => [] } });
const emit = defineEmits([ 'update:modelValue' ]);

const dialogOpen = ref(false);

const selectedLayers = computed(() =>
    (props.modelValue ?? [])
        .map((id) => idToLayerMap.value.get(id))
        .filter(Boolean)
);

function addLayer(layerId) {
    if (!layerId) return;
    if (!props.modelValue.includes(layerId)) {
        emit('update:modelValue', [ ...props.modelValue, layerId ]);
    }
}

function removeLayer(id) {
    emit('update:modelValue', props.modelValue.filter(v => v !== id));
}

watch(
    () => props.modelValue,
    (newIds, oldIds) => {
      const prev = oldIds ?? [];
      const added = newIds.filter(id => !prev.includes(id));
      const removed = prev.filter(id => !newIds.includes(id));

      const baseLayers = store.getters.layerConfigsByAttributes({
          baselayer: true,
          showInLayerTree: true
      });
      let maxBaselayerZIndex = Math.max(...baseLayers.map(layer => layer.zIndex));

      if (added.length) {
          for (const id of added) {
            store.dispatch('addOrReplaceLayer', {
              layerId: id,
              zIndex: ++maxBaselayerZIndex
            });
          }
      }

      for (const id of removed) {
          store.dispatch('Modules/LayerTree/removeLayer', { id });
      }
    },
    { immediate: true, deep: false }
);
</script>

<template>
  <v-row
    class="mb-2"
    style="margin-top: 0!important;"
  >
    <v-col
      cols="12"
      class="p-0"
    >
      <v-list
        density="comfortable"
        class="pa-0"
      >
        <v-list-item
          v-for="l in selectedLayers"
          :key="l.id"
          class="pa-0"
        >
          <v-sheet
            width="100%"
            rounded
            class="d-flex align-center px-3 py-2"
            style="border: 1px solid #e1e1e1"
          >
            <v-icon
              :icon="mdiEye"
              class="mr-2"
            />
            <span class="grow">{{ l.name }}</span>
            <v-icon
              :icon="mdiTrashCan"
              class="cursor-pointer"
              @click="removeLayer(l.id)"
            />
          </v-sheet>
        </v-list-item>

        <div
          v-if="selectedLayers.length === 0"
          class="text-medium-emphasis py-2"
        >
          Keine Ebenen ausgewählt.
        </div>
      </v-list>
    </v-col>
  </v-row>

  <v-row
    class="mb-2"
    justify="center"
  >
    <v-btn
      variant="flat"
      size="small"
      class="information-btn"
      :prepend-icon="mdiMapMarkerPlusOutline"
      :append-icon="mdiChevronRight"
      rounded
      @click="dialogOpen = true"
    >
      Informationsebene hinzufügen
    </v-btn>
  </v-row>

  <v-dialog
    v-model="dialogOpen"
    max-width="520"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        Informationsebene
        <v-spacer />
        <v-btn
          icon
          variant="text"
          @click="dialogOpen = false"
        >
          <v-icon :icon="mdiClose" />
        </v-btn>
      </v-card-title>

      <CategoryBrowser
        :items="layersTree"
        :loading="loading"
        @select:layer="(l) => addLayer(l.id)"
      />

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="dialogOpen = false"
        >
          Schließen
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.information-btn {
    background-color: var(--pill-color-secondary);
}
</style>
