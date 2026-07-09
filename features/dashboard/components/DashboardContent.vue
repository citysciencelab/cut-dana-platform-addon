<script setup>
import { useTranslation } from 'i18next-vue';
import { computed, watch } from 'vue';
import { useStore } from 'vuex';

import { exportStories } from '../../stories/services/exportStories.js';

import StoryCard from './Stories/StoryCard.vue';

// Helper functions to determine current user context
// Note: In a production app, these would use proper authentication
const store = useStore();
const { t } = useTranslation();
const storiesDisplayMode = computed(() => store.state.Modules.DataNarrator.DashboardStore.mode);
const stories = computed(() => store.state.Modules.DataNarrator.StoryStore.stories);
const loading = computed(() => store.state.Modules.DataNarrator.StoryStore.loading);
const err = computed(() => store.state.Modules.DataNarrator.StoryStore.error);

// Get userId from store (if available) - this would be set after login
const userId = computed(() => store.state.Modules.Login?.userId);
const isAdmin = computed(() => store.state.Modules.Login?.isAdmin || false);

// Filter stories that can be exported by current user
const exportableStories = computed(() => {
  if (!stories.value) return [];
  if (isAdmin.value) return stories.value;
  return stories.value.filter(story => story.owner === userId.value);
});

const fetchStories = () => {
  store.dispatch('Modules/DataNarrator/StoryStore/fetchStories', storiesDisplayMode.value);
};

const onStoryCopied = () => {
  store.commit('Modules/DataNarrator/DashboardStore/setMode', 'my');
};

watch(storiesDisplayMode, () => {
  fetchStories();
}, { immediate: true });

</script>

<template>
  <div class="dashboard-content-container">
    <div v-if="loading">
      Loading...
    </div>
    <div v-else-if="err">
      Error: {{ err }}
    </div>
    <div
      v-else-if="stories.length > 0"
      class="stories-container"
    >
      <StoryCard
        v-for="story in [...stories].reverse()"
        :key="story.id + story.updatedAt"
        :story="story"
        :grid="true"
        @deleted="fetchStories"
        @published="fetchStories"
        @copied="onStoryCopied"
      />
    </div>
    <div
      v-else
      class="no-results"
    >
      {{ t('additional:modules.dataNarrator.storyList.noStoriesAvailable') }}
    </div>

    <!-- Export button - visible for owner/admin -->
    <!-- Show for each story owned by current user, or always show for admin -->
    <div
      v-for="story in exportableStories"
      :key="story.id"
      class="export-button-container"
    >
      <v-btn
        color="primary"
        variant="elevated"
        @click="exportStories([story])"
      >
        Export: {{ story.title }}
      </v-btn>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dashboard-content-container {
  padding: 1rem;
  width: 70%;
  margin: 0 auto;

  @media screen and (max-width: 768px) {
    width: 100%;
  }

  .stories-container {
    columns: 300px;

    > * {
      margin-bottom: 1rem;
    }
  }

  .no-results {
    color: #808080;
    text-align: center;
  }

  .export-button-container {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
  }
}
</style>
