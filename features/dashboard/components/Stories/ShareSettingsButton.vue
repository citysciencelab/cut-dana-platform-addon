<script setup>
import { mdiEyeSettings } from '@mdi/js';
import { useTranslation } from 'i18next-vue';

const { t } = useTranslation();

/**
 *
 */
function toggleSharedSettings () {
  console.log('toggleSharedSettings');
}
</script>

<template>
  <v-tooltip top>
    <template>
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

