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
        display: flex;
        flex-wrap: wrap;
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

    .no-results {
        color: #808080;
        text-align: center;
    }
}
</style>
