<script>
import PlayerContent from "./PlayerContent.vue";
import PlayerHeader from "./PlayerHeader.vue";
import PlayerFooter from "./PlayerFooter.vue";

export default {
    name: "ClassicPlayer",
    components: {
        PlayerHeader,
        PlayerContent,
        PlayerFooter
    },
    props: {
        currentStepIndex: {
            type: Number,
            default: 0
        },
        currentChapter: {
            type: Object,
            default: null
        },
        currentStep: {
            type: Object,
            default: null
        },
        showMode: {
            type: String,
            default: "classic"
        }
    }
};
</script>

<template>
    <div
        id="classic-player"
    >
        <PlayerHeader
            :chapter="currentChapter"
            @click="$emit('setCurrentStepIndex', null)"
            v-on="$listeners"
        />
        <PlayerContent
            :step="currentStep"
            class="tool-dataNarrator-content"
        />
        <PlayerFooter
            :current-step-index="currentStepIndex"
            :show-mode="showMode"
            v-on="$listeners"
        />
    </div>
</template>

<style scoped>
#classic-player {
    display: grid;
    grid-gap: 10px;
    overflow: hidden;
}
</style>
