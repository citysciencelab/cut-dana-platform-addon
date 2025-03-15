<script setup>
import StoryCard from "./Stories/StoryCard.vue";
import {useDashboard} from "../hooks/useDashboard";
import {useDashboardStore} from "../store/useDashboardStore";
import {useGetStories} from "../../../composables/services/stories/useGetStories";

const {stories, error, loading} = useDashboard();

</script>

<template>
    <div class="stories-card-container">
        <div v-if="loading">Loading...</div>
        <div v-else-if="error">Error: {{ error }}</div>
        <StoryCard
            v-else
            v-for="story in stories"
            :key="story.id + story.updatedAt"
            :story="story"
            :grid="true"
            @imageLoaded="() => {console.log('imageLoaded')}"
        />
    </div>
</template>

<style scoped lang="scss">
.stories-card-container {
    display: flex;
    flex-wrap: wrap;
    padding: 1rem;
    gap: 0.4rem;

    .card {
        border: solid 1px #000;
        border-radius: .4rem;
        padding: .4rem;
        min-width: 16rem;

        .card-footer {
            display: flex;
            justify-content: flex-end;
        }
    }
}
</style>
