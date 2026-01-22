<script setup>
import { mdiTrashCan, mdiPencil, mdiEye } from '@mdi/js';
import { ref } from 'vue';

import { getGeoJSONLayer } from '../../../../utils/geoJSON';
import TransparencySlider from '../step/layers/TransparencySlider.vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => ([])
  }
});

const emit = defineEmits([ 'editAsset', 'removeAsset' ]);

const transparencyDialog = ref(false);
const activeLayerId = ref(null);

function toggleTransparencySlider(layer) {
  transparencyDialog.value = !transparencyDialog.value;
  activeLayerId.value = activeLayerId.value === layer.id ? null : layer.id;
}

function onTransparencyChange(asset, transparency) {
  const layer = getGeoJSONLayer(); 
  const opacity = 1 - (transparency/100);
  layer.opacity = opacity;
  layer.setOpacity(opacity);
  layer.changed();
}
function onTransparencyFinalChange(asset, transparency) {
  asset['transparency'] = transparency;
}
</script>

<template>
  <v-list
    density="comfortable"
    class="pa-0"
  >
    <v-list-item
      v-for="asset in props.modelValue"
      :key="asset.id"
      class="pa-0"
    >
      <v-sheet
        width="100%"
        rounded
        class="d-flex align-center px-3 py-2"
        style="border: 1px solid #e1e1e1"
      >
        <span class="flex-grow-1">{{ asset.title }}</span>
        <v-icon
          :icon="mdiEye"
          class="mr-2"
          @click="toggleTransparencySlider(asset)"
        />
        <v-icon
          :icon="mdiTrashCan"
          class="cursor-pointer mr-2"
          @click="emit('removeAsset', asset.id)"
        />
        <v-icon
          :icon="mdiPencil"
          class="cursor-pointer"
          @click="emit('editAsset', asset.id)"
        />
      </v-sheet>
      <div
        v-if="activeLayerId === asset.id"
        class="mt-2"
      >
        <TransparencySlider
          :initial-transparency="asset.transparency"
          @update="onTransparencyChange(asset, $event)"
          @final="onTransparencyFinalChange(asset, $event)"
        />
      </div>
    </v-list-item>
  </v-list>
</template>
