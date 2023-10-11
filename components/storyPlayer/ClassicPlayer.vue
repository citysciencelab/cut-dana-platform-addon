<script>
import StoryMenu from "./StoryMenu.vue";
import getters from "../../store/gettersDataNarrator";
import {mapActions, mapGetters, mapMutations} from "vuex";
import mutations from "../../store/mutationsDataNarrator";
import actions from "../../store/actionsDataNarrator";

export default {
    name: "ClassicPlayer",
    components: {
        StoryMenu
    },
    model: {},
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
        loadedContent: {
            type: String,
            default: null
        },
        isPreview: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters))
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions))
    }
};
</script>

<template>
    <div
        id="classic-player"
    >
        <StoryMenu :initial-auto-play="currentStory.storyInterval !== null" :current-step-index="currentStepIndex" :is-preview="isPreview" />

        <h2 v-if="currentChapter">
            {{ currentChapter.chapterTitle }}
        </h2>
        <h1>{{ currentStep.title }}</h1>

        <div
            v-if="currentStep"
            class="tool-dataNarrator-content"
        >
            <div
                v-if="loadedContent"
                v-html="loadedContent"
            />
        </div>
    </div>
</template>

<style scoped>
#classic-player {
    display: grid;
    grid-gap: 10px;
    overflow: hidden;
}
</style>
