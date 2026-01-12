<script setup>
import { mdiStar, mdiStarOutline } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { ref } from 'vue';

import { backendUrl } from '../../../../store/contantsDataNarrator.js';
import { createLogger } from '../../../../utils/logger.js';

const { t } = useTranslation();

const logger = createLogger('FeaturedButton.vue');

const props = defineProps({
  storyId: {
    type: Number,
    required: true
  },
  isFeatured: {
    type: Boolean,
    required: true
  }
});

const featured = ref(props.isFeatured);

async function makeItFeatured() {
  try {
    const res = await fetch(`${backendUrl}/stories/${props.storyId}/featured/${!featured.value}`, {
      method: 'POST'
    });
    if (res.ok) {
      featured.value = !featured.value;
    } else {
      logger.error('Failed to toggle featured', await res.json());
    }
  } catch (error) {
    logger.error('Failed to toggle featured', error);
  }
}
</script>

<template>
  <v-tooltip location="top">
    <template #activator="{ props: actv }">
      <v-btn
        v-bind="actv"
        id="featured-button"
        variant="text"
        density="compact"
        icon
        @click.stop="makeItFeatured"
      >
        <v-icon
          size="20"
          :icon="featured ? mdiStar : mdiStarOutline"
        />
      </v-btn>
    </template>
    <span>
      {{ t("additional:modules.dataNarrator.button.featured", "Featured") }}
    </span>
  </v-tooltip>
</template>
