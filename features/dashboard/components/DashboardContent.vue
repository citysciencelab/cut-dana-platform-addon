<script setup>
import { computed, watch } from 'vue';
import { useStore } from 'vuex';

import StoryCard from './Stories/StoryCard.vue';

const store = useStore();
const storiesDisplayMode = computed(() => store.state.Modules.DataNarrator.DashboardStore.mode);
const stories = computed(() => store.state.Modules.DataNarrator.StoryStore.stories);
const loading = computed(() => store.state.Modules.DataNarrator.StoryStore.loading);
const err = computed(() => store.state.Modules.DataNarrator.StoryStore.error);

const fetchStories = () => {
  store.dispatch('Modules/DataNarrator/StoryStore/fetchStories', storiesDisplayMode.value);
};

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
        v-for="story in stories.toReversed()"
        :key="story.id + story.updatedAt"
        :story="story"
        :grid="true"
        @deleted="fetchStories"
        @published="fetchStories"
      />
    </div>
    <div
      v-else
      class="no-results"
    >
      No stories available
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

        >* {
            margin-bottom: 1rem;
        }
    }

    .no-results {
        color: #808080;
        text-align: center;
    }
}
</style>
