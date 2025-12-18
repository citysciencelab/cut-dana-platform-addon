<script setup>
import { mdiStar, mdiStarOutline } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { ref } from 'vue';

import { toggleFeatured } from '../../services/toggleFeatured';

const { t } = useTranslation();

const props = defineProps({
  storyId: {
    type: Number,
    required: true
  },
  isFeatured: {
    type: Boolean,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

const featured = ref(props.isFeatured);

async function makeItFeatured() {
  if (!props.isAdmin) return;

  try {
    const res = await toggleFeatured(props.storyId, !featured.value);

    if (res.ok) {
      featured.value = !featured.value;
    } else {
      console.error('Failed to toggle featured', await res.json());
    }
  } catch (error) {
    console.error('Failed to toggle featured', error);
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
        :disabled="!isAdmin"
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

