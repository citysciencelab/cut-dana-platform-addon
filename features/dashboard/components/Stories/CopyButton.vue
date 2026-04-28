<script setup>
import { mdiContentCopy } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { ref } from 'vue';
import { useStore } from 'vuex';

import { createLogger } from '../../../../utils/logger.js';
import ConfirmationDialog from '../../../shared/ConfirmationDialog.vue';
import { copyStory } from '../../../stories/services/copyStory';

const logger = createLogger('CopyButton.vue');
const { t } = useTranslation();
const store = useStore();

const { storyId } = defineProps({
  storyId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits([ 'copied' ]);
const isLoading = ref(false);
const copyStoryDialogVisible = ref(false);

async function copyStoryWithConfirm() {
  isLoading.value = true;
  try {
    await copyStory(storyId);
    store.commit('Modules/DataNarrator/DashboardStore/setMode', 'my');
    emit('copied');
  } catch (error) {
    logger.error(error);
  } finally {
    isLoading.value = false;
  }
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
        :loading="isLoading"
        @click="copyStoryDialogVisible = true"
      >
        <v-icon
          size="18"
          :icon="mdiContentCopy"
        />
      </v-btn>
    </template>
    {{ t("additional:modules.dataNarrator.button.copyStory") }}
  </v-tooltip>

  <ConfirmationDialog
    v-model="copyStoryDialogVisible"
    :message="t('additional:modules.dataNarrator.confirm.copyStory.description')"
    :title="t('additional:modules.dataNarrator.confirm.copyStory.title')"
    :confirm-text="t('additional:modules.dataNarrator.confirm.copyStory.confirmButton')"
    :cancel-text="t('additional:modules.dataNarrator.confirm.copyStory.denyButton')"
    @confirm="copyStoryWithConfirm"
  />
</template>
