<script setup>
import { useTranslation } from 'i18next-vue';
import { computed, ref, watch } from 'vue';

const { t } = useTranslation();
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  asset: {
    type: Object,
    default: null
  }
});

const workingCopy = ref({
  id: null,
  title: '',
  geoJson: null
});
const jsonError = ref(null);

watch(() => [ props.asset ], () => {
  const geoJson = props.asset?.geoJson
    ? JSON.stringify(JSON.parse(props.asset.geoJson), null, 2)
    : null;

  workingCopy.value = {
    id: props.asset?.id || null,
    title: props.asset?.title || '',
    geoJson
  };
}, { immediate: true });

const emit = defineEmits([ 'closeClicked', 'assetSaved', 'update:open' ]);
const editMode = computed(() => !!props.asset?.id);
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
});
const dialogTitle = computed(() =>
  editMode.value
    ? t('additional:modules.dataNarrator.geojson.editAssetTitle')
    : t('additional:modules.dataNarrator.geojson.geoJSONLabel')
);

const onFileSelectionChanged = (file) => {
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
          if (!workingCopy.value.title) {
            workingCopy.value.title = file.name;
          }
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
  }
};

const onAssetSave = () => {
  if (workingCopy.value.geoJson) {
    workingCopy.value.geoJson = JSON.stringify(
      JSON.parse(workingCopy.value.geoJson)
    );
  }
  emit('assetSaved', { ...workingCopy.value });
};
</script>

<template>
  <v-dialog
    v-model="isOpen"
    max-width="480"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        {{ dialogTitle }}
        <v-spacer />
      </v-card-title>
      <v-row v-if="!editMode">
        <v-col cols="12">
          <v-file-upload
            :title="t('additional:modules.dataNarrator.geojson.uploadFile')"
            density="compact"
            variant="compact"
            :multiple="false"
            show-size
            clearable
            @update:model-value="onFileSelectionChanged"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="workingCopy.title"
            :label="t('additional:modules.dataNarrator.geojson.titleLabel')"
            variant="outlined"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-textarea
            v-model="workingCopy.geoJson"
            :label="t('additional:modules.dataNarrator.geojson.geoJSONContentLabel')"
            variant="outlined"
          />
        </v-col>
      </v-row>
      <v-card-actions>
        <v-spacer />
        <v-btn
          :text="t('additional:modules.dataNarrator.button.close')"
          variant="text"
          @click="$emit('closeClicked')"
        />
        <v-btn
          color="primary"
          :text="t('additional:modules.dataNarrator.button.submitEditStep')"
          variant="tonal"
          @click="onAssetSave"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
