<script setup>
import { mdiExportVariant } from '@mdi/js';
import { useTranslation } from 'i18next-vue';

import { exportStories } from '../../../stories/services/exportStories';

const { t } = useTranslation();

const { story } = defineProps({
  story: {
    type: Object,
    required: true
  }
});

function exportStory() {
  exportStories([ story ]);
}
</script>

<template>
  <v-tooltip location="top">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        icon
        density="compact"
        @click="exportStory"
      >
        <v-icon
          size="18"
          :icon="mdiExportVariant"
        />
      </v-btn>
    </template>
    {{ t('additional:modules.dataNarrator.dashboardView.exportStory') }}
  </v-tooltip>
</template>
