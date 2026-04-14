<script setup>
import { mdiChevronRight, mdiMapMarkerPlusOutline } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { computed, ref, watch } from 'vue';

import GeoJSONList from './GeoJSONList.vue';

const { t } = useTranslation();

const props = defineProps({
  modelValue: { type: Array, default: () => ([]) }
});
const emit = defineEmits([ 'update:modelValue' ]);

// Local copy so additions/removals are visible immediately without prop round-trip
const assets = ref([ ...(props.modelValue ?? []) ]);
watch(() => props.modelValue, (val) => {
  assets.value = [ ...(val ?? []) ];
});

const selectedAssetId = ref(null);
const jsonError = ref(null);
const workingCopy = ref({ id: null, title: '', geoJson: null });
const fileModel = ref(null);

const selectedAsset = computed(() =>
  assets.value.find(a => a.id === selectedAssetId.value) ?? null
);

const editMode = computed(() => !!workingCopy.value.id);
const canSave = computed(() => !!workingCopy.value.geoJson);

watch(selectedAsset, (asset) => {
  const geoJson = asset?.geoJson
    ? JSON.stringify(JSON.parse(asset.geoJson), null, 2)
    : null;
  workingCopy.value = {
    id: asset?.id || null,
    title: asset?.title || '',
    geoJson
  };
}, { immediate: true });

function startEdit(id) {
  selectedAssetId.value = id;
  jsonError.value = null;
}

function resetForm() {
  selectedAssetId.value = null;
  workingCopy.value = { id: null, title: '', geoJson: null };
  jsonError.value = null;
  fileModel.value = null;
}

function removeAsset(id) {
  assets.value = assets.value.filter(a => a.id !== id);
  emit('update:modelValue', assets.value);
  if (selectedAssetId.value === id) resetForm();
}

function onFileSelectionChanged(file) {
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (!json.type || json.type !== 'FeatureCollection') {
          workingCopy.value.geoJson = null;
          jsonError.value = t('additional:modules.dataNarrator.geojson.invalidGeoJSON');
        } else {
          workingCopy.value.geoJson = JSON.stringify(json, null, 2);
          if (!workingCopy.value.title) workingCopy.value.title = file.name;
          jsonError.value = null;
        }
      } catch {
        jsonError.value = t('additional:modules.dataNarrator.geojson.invalidJSON');
      }
    };
    reader.onerror = () => {
      jsonError.value = t('additional:modules.dataNarrator.geojson.errorReadingFile');
    };
    reader.readAsText(file);
  } else {
    workingCopy.value.geoJson = null;
    workingCopy.value.title = '';
    jsonError.value = null;
  }
}

function onAssetSave() {
  if (!canSave.value) return;
  const asset = {
    ...workingCopy.value,
    geoJson: JSON.stringify(JSON.parse(workingCopy.value.geoJson))
  };
  if (asset.id) {
    assets.value = assets.value.map(a => (a.id === asset.id ? asset : a));
  } else {
    asset.id = crypto.randomUUID();
    assets.value = [ ...assets.value, asset ];
  }
  emit('update:modelValue', assets.value);
  resetForm();
}
</script>

<template>
  <!-- Existing items -->
  <GeoJSONList
    v-if="assets.length"
    :model-value="assets"
    class="mb-3"
    @remove-asset="removeAsset"
    @edit-asset="startEdit"
  />

  <!-- Inline add / edit form -->
  <div class="geojson-form">
    <div
      v-if="!editMode"
      class="mb-2"
    >
      <v-file-upload
        v-model="fileModel"
        :title="t('additional:modules.dataNarrator.geojson.uploadFile')"
        density="compact"
        variant="compact"
        :multiple="false"
        show-size
        clearable
        @update:model-value="onFileSelectionChanged"
      />
    </div>

    <v-text-field
      v-model="workingCopy.title"
      :label="t('additional:modules.dataNarrator.geojson.titleLabel')"
      variant="outlined"
      density="compact"
      class="mb-1"
    />

    <v-textarea
      v-model="workingCopy.geoJson"
      :label="t('additional:modules.dataNarrator.geojson.geoJSONContentLabel')"
      variant="outlined"
      density="compact"
      rows="5"
      class="mb-1"
    />

    <p
      v-if="jsonError"
      class="text-error text-caption mb-1"
    >
      {{ jsonError }}
    </p>

    <div class="d-flex justify-end gap-2">
      <v-btn
        v-if="editMode"
        variant="text"
        size="small"
        @click="resetForm"
      >
        {{ t('additional:modules.dataNarrator.button.cancel') }}
      </v-btn>
      <v-btn
        variant="flat"
        size="small"
        class="geojson-action-btn"
        :prepend-icon="editMode ? undefined : mdiMapMarkerPlusOutline"
        :append-icon="mdiChevronRight"
        :disabled="!canSave"
        rounded
        @click="onAssetSave"
      >
        {{
          editMode
            ? t('additional:modules.dataNarrator.button.submitEditStep')
            : t('additional:modules.dataNarrator.geojson.addGeoJSON')
        }}
      </v-btn>
    </div>
  </div>
</template>

<style scoped lang="scss">

.geojson-action-btn {
  background-color: #ffffff !important;
  color: #1f2937 !important;
  border: 1px solid rgba(31, 41, 55, 0.2);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
  font-weight: 600;
  letter-spacing: 0.1px;

  &:hover {
    background-color: #f8fafc !important;
    border-color: rgba(31, 41, 55, 0.35);
  }
}
</style>
