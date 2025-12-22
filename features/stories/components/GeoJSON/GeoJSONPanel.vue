<script setup>
import { mdiMapMarkerPlusOutline, mdiChevronRight } from '@mdi/js';

import { computed, ref } from 'vue';

import GeoJSONDialog from './GeoJSONDialog.vue';
import GeoJSONList from './GeoJSONList.vue';

// type GeoJSONAsset = {
//   id: string;
//   title: string;
//   geoJson: JsonValue;
// }

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => ([])
  }
});
const emit = defineEmits([ 'update:modelValue' ]);

const selectedAssetId = ref(null);
const geoJsonDialogOpen = ref(false);
const selectedAsset = computed(() =>
  (props.modelValue ?? []).filter(asset => asset.id === selectedAssetId.value)[0]
);

function removeAsset(id) {
  const updated = props.modelValue.filter(asset => asset.id !== id);
  emit('update:modelValue', updated);
}

function editAsset(id) {
  selectedAssetId.value = id;
  geoJsonDialogOpen.value = true;
}

function onDialogClose() {
  geoJsonDialogOpen.value = false;
  selectedAssetId.value = null;
}

function onAssetSave(asset) {
  let updated = [];
  if (asset.id) {
    updated = props.modelValue.map(a => (a.id === asset.id ? asset : a));
  } else {
    const newId = crypto.randomUUID();
    asset.id = newId;
    updated = [ ...props.modelValue, asset ];
  }
  emit('update:modelValue', updated);
  geoJsonDialogOpen.value = false;
  selectedAssetId.value = null;
}

</script>

<template>
  <v-row class="mb-1">
    <v-col
      cols="12"
      class="p-0"
    >
      {{ $t('additional:modules.dataNarrator.geojson.panelTitle') }}
    </v-col>
  </v-row>
  <GeoJSONList
    :model-value="modelValue"
    @remove-asset="removeAsset"
    @edit-asset="editAsset"
  />
  <GeoJSONDialog
    :open="geoJsonDialogOpen"
    :asset="selectedAsset"
    @close-clicked="onDialogClose"
    @asset-saved="onAssetSave"
  />
  <v-row
    class="mb-2"
    justify="center"
  >
    <v-btn
      variant="flat"
      size="small"
      class="add-geojson-btn"
      :prepend-icon="mdiMapMarkerPlusOutline"
      :append-icon="mdiChevronRight"
      rounded
      @click="geoJsonDialogOpen = true"
    >
      GeoJSON hinzufügen
    </v-btn>
  </v-row>
</template>
