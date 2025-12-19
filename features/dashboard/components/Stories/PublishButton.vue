<script setup>
import { mdiCloudUploadOutline, mdiCloudOffOutline } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { ref, computed } from 'vue';

import { backendUrl } from '../../../../store/contantsDataNarrator.js';

const { t } = useTranslation();

const props = defineProps({
  storyId: { type: Number, required: true },
  isDraft: { type: Boolean, required: true },
});

const emit = defineEmits([
  'success'
]);

const loading = ref(false);

const isDraft = computed(() => props.isDraft);
const icon = computed(() => (isDraft.value ? mdiCloudUploadOutline : mdiCloudOffOutline));
const btnLabel = computed(() =>
  isDraft.value
    ? t('additional:modules.dataNarrator.button.publish', 'Publish')
    : t('additional:modules.dataNarrator.button.unpublish', 'Unpublish')
);

async function onClick() {
  if (loading.value) return;
  loading.value = true;
  try {
    await fetch(`${backendUrl}/stories/new/${props.storyId}/publish-state`, {
      method: 'PUT',
      body: JSON.stringify({ isDraft: !isDraft.value }),
    });
    emit('success');
  } catch (err) {
    console.error('Failed to toggle publish state', err);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-tooltip location="top">
    <template #activator="{ props: actv }">
      <v-btn
        v-bind="actv"
        variant="text"
        density="compact"
        icon
        :loading="loading"
        :aria-label="btnLabel"
        @click.stop="onClick"
      >
        <v-icon
          size="20"
          :icon="icon"
        />
      </v-btn>
    </template>
    <span>{{ btnLabel }}</span>
  </v-tooltip>
</template>
