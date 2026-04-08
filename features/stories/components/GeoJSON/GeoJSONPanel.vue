<script setup>
import { mdiMapMarkerPlusOutline } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { computed, ref, watch } from 'vue';

import GeoJSONList from './GeoJSONList.vue';

const { t } = useTranslation();

const props = defineProps({
  modelValue: { type: Array, default: () => ([]) }
});
const emit = defineEmits([ 'update:modelValue' ]);

const selectedAssetId = ref(null);
const jsonError = ref(null);
const workingCopy = ref({ id: null, title: '', geoJson: null });

const selectedAsset = computed(() =>
  (props.modelValue ?? []).find(a => a.id === selectedAssetId.value) ?? null
);

const editMode = computed(() => !!workingCopy.value.id);

const formTitle = computed(() =>
  editMode.value
    ? t('additional:modules.dataNarrator.geojson.editAssetTitle')
    : t('additional:modules.dataNarrator.geojson.newAssetTitle')
);

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
}

function removeAsset(id) {
  emit('update:modelValue', props.modelValue.filter(a => a.id !== id));
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
    reader.onerror = () => { jsonError.value = t('additional:modules.dataNarrator.geojson.errorReadingFile'); };
    reader.readAsText(file);
  } else {
    workingCopy.value.geoJson = null;
  }
}

function onAssetSave() {
  if (workingCopy.value.geoJson) {
    workingCopy.value.geoJson = JSON.stringify(JSON.parse(workingCopy.value.geoJson));
  }
  const asset = { ...workingCopy.value };
  let updated;
  if (asset.id) {
    updated = props.modelValue.map(a => (a.id === asset.id ? asset : a));
  } else {
    asset.id = crypto.randomUUID();
    updated = [ ...props.modelValue, asset ];
  }
  emit('update:modelValue', updated);
  resetForm();
}
</script>

<template>
  <!-- Existing items -->
  <GeoJSONList
    v-if="modelValue.length"
    :model-value="modelValue"
    class="mb-3"
    @remove-asset="removeAsset"
    @edit-asset="startEdit"
  />

  <!-- Inline add / edit form -->
  <div class="geojson-form">
    <p class="text-body-2 font-weight-medium mb-2">
      {{ formTitle }}
    </p>

    <div
      v-if="!editMode"
      class="mb-2"
    >
      <v-file-upload
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
      :label="t('additional:modules.dataNarrator.geojson.geoJSONLabel')"
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
        color="primary"
        variant="tonal"
        size="small"
        :prepend-icon="editMode ? undefined : mdiMapMarkerPlusOutline"
        @click="onAssetSave"
      >
        {{ editMode
          ? t('additional:modules.dataNarrator.button.submitEditStep')
          : t('additional:modules.dataNarrator.geojson.addGeoJSON') }}
      </v-btn>
    </div>
  </div>
</template>

<style scoped lang="scss">
.geojson-form {
  background: #f9f9f9;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  padding: 12px;
}
</style>
