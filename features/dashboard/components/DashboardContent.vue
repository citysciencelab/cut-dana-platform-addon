<script setup>

import StoryCard from "./Stories/StoryCard.vue";
import {useDashboard} from "../hooks/useDashboard";

const store = useDashboard();

store.getAllStories();
</script>

<template>
    <div class="stories-card-container">
        <StoryCard
            v-for="story in store.stories"
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
