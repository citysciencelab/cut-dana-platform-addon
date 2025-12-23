<script setup>
import { mdiEyeSettings } from '@mdi/js';
import { useTranslation } from 'i18next-vue';

import { createLogger } from '../../../../utils/logger.js';

const { t } = useTranslation();

const logger = createLogger('ShareSettingsButton.vue');

/**
 *
 */
function toggleSharedSettings () {
  logger.debug('toggleSharedSettings');
}
</script>

<template>
  <v-tooltip top>
    <template #activator="">
      <v-icon
        id="share-button"
        color="green"
        @click="toggleSharedSettings"
      >
        {{ mdiEyeSettings }}
      </v-icon>
    </template>
    <span>
      {{ t("additional:modules.dataNarrator.button.shareSettings") }}
    </span>
  </v-tooltip>
</template>

