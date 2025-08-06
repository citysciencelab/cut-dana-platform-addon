<script setup>
import StoryCard from "./Stories/StoryCard.vue";
import {useDashboard} from "../hooks/useDashboard";

const {stories, error, loading} = useDashboard();

</script>

<template>
    <div class="dashboard-content-container">
        <div v-if="loading">
            Loading...
        </div>
        <div v-else-if="error">
            Error: {{ error }}
        </div>
        <div v-else-if="stories.length > 0" class="stories-container">
            <StoryCard
                v-for="story in stories"
                :key="story.id + story.updatedAt"
                :story="story"
                :grid="true"
                @imageLoaded="() => {console.log('imageLoaded')}"
            />
        </div>
        <div v-else class="no-results">No stories available</div>
    </div>
</template>

<style scoped lang="scss">
.dashboard-content-container {
    padding: 1rem;

    .stories-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        align-items: flex-start;
    }

    .no-results {
        color: #808080;
        text-align: center;
    }
}
</style>
