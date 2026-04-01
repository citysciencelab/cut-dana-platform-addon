<script setup>
import { mdiClose, mdiCubeScan, mdiChevronRight } from '@mdi/js';
import { ref } from 'vue';
import { useTranslation } from 'i18next-vue';

import ThreeDNavigation from './ThreeDNavigation.vue';

defineProps({
  navigation3D: {
    type: Object,
    default: () => ({}),
  }
});

const emit = defineEmits(['update:navigation3D', 'modelCreated']);

const { t } = useTranslation();
const dialogOpen = ref(false);
</script>

<template>
  <v-row
    class="mb-2"
    justify="center"
  >
    <v-btn
      variant="flat"
      size="small"
      class="threed-btn"
      :prepend-icon="mdiCubeScan"
      :append-icon="mdiChevronRight"
      rounded
      @click="dialogOpen = true"
    >
      {{ t('additional:modules.dataNarrator.label.threeDFiles') }}
    </v-btn>
  </v-row>

  <v-dialog
    v-model="dialogOpen"
    max-width="480"
  >
    <v-card>
      <v-card-title class="d-flex align-center py-2 px-4">
        {{ t('additional:modules.dataNarrator.3dForm') }}
        <v-spacer />
        <v-btn
          icon
          variant="text"
          size="small"
          @click="dialogOpen = false"
        >
          <v-icon :icon="mdiClose" />
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <ThreeDNavigation
          :model-value="navigation3D"
          @update:model-value="emit('update:navigation3D', $event)"
          @model-created="emit('modelCreated', $event)"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="dialogOpen = false"
        >
          {{ t('additional:modules.dataNarrator.button.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.threed-btn {
  background-color: var(--pill-color-secondary, #e8e0ee);
}
</style>
