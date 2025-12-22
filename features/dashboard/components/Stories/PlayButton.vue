<script setup>

import { mdiPlayOutline } from '@mdi/js';
import { useTranslation } from 'i18next-vue';

const { t } = useTranslation();
const emit = defineEmits([ 'click' ]);

function onClick() {
  emit('click');
}

</script>

<template>
  <v-tooltip location="top">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        color="black"
        rounded
        size="small"
        variant="flat"
        @click="onClick"
      >
        <v-icon
          id="play-button"
          color="white"
        >
          {{ mdiPlayOutline }}
        </v-icon>
      </v-btn>
    </template>
    {{ t("additional:modules.dataNarrator.play.start") }}
  </v-tooltip>
</template>

<style scoped lang="scss">
#play-button {
    float:right;
    color: #413FAB;
}
</style>
