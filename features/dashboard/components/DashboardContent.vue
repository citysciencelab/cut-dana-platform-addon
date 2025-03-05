<script setup>

import StoryCard from "./Stories/StoryCard.vue";
import {useDataNarrator} from "../hooks/useDashboard";

const {stories, getAllStories} = useDataNarrator();
</script>

<template>
    <div class="stories-card-container">
        <StoryCard
            v-for="story in stories"
            :key="story.id + story.updatedAt"
            :story="story"
            :grid="true"
            @refreshStoryList="getAllStories"
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
