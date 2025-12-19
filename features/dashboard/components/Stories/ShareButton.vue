<script setup>
import { mdiShareVariant } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { ref, computed } from 'vue';

import ShareDialog from './ShareDialog.vue';

const { t } = useTranslation();

const props = defineProps({
  storyId: { type: Number, required: true },
  title: { type: String, default: 'Story' },
});

const open = ref(false);
const btnLabel = computed(() => t('additional:modules.dataNarrator.button.share', 'Share'));

function onClick() {
  open.value = true;
}
</script>

<template>
  <v-tooltip location="top">
    <template #activator="{ props: actv }">
      <v-btn
        v-bind="actv"
        id="share-button"
        variant="text"
        density="compact"
        icon
        :aria-label="btnLabel"
        @click.stop="onClick"
      >
        <v-icon
          size="16"
          :icon="mdiShareVariant"
        />
      </v-btn>
    </template>
    <span>{{ btnLabel }}</span>
  </v-tooltip>

  <ShareDialog
    v-model="open"
    :title="title"
    :story-id="props.storyId"
  />
</template>
