<script setup>
import { useDashboard } from '../hooks/useDashboard';

import StoryCard from './Stories/StoryCard.vue';

const { stories, error, loading, refetchStories } = useDashboard();
</script>

<template>
  <div class="dashboard-content-container">
    <div v-if="loading">
      Loading...
    </div>
    <div v-else-if="error">
      Error: {{ error }}
    </div>
    <div
      v-else-if="stories.length > 0"
      class="stories-container"
    >
      <StoryCard
        v-for="story in stories.reverse()"
        :key="story.id + story.updatedAt"
        :story="story"
        :grid="true"
        @deleted="refetchStories"
        @published="refetchStories"
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
