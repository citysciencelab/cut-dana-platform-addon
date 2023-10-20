<script>

import {mapGetters} from "vuex";
import getters from "../../store/gettersDataNarrator";

export default {
    name: "TableOfContents",
    model: {
        prop: "steps",
        event: "click"
    },
    props: {
        // All steps of the current story
        steps: {
            type: Array,
            default: null
        }
    },
    computed: {
        ...mapGetters("Tools/StoryTellingTool", Object.keys(getters))
    },
    methods: {
        scrollToStep (stepIndex) {
            document.getElementsByClassName("stepper")[stepIndex].scrollIntoView({block: "center"});
            this.$emit("close-toc");
        }
    }
};
</script>

<template>
    <div class="tob-list">
        <ul class="list-unstyled step-list">
            <li
                v-for="(step, stepIndex) in steps"
                :key="stepIndex + step.title"
                role="button"
                tabindex="0"
                @click="scrollToStep(stepIndex)"
                @keydown="scrollToStep(stepIndex)"
            >
                <span
                    :style="{ marginLeft: (step.depth * 10) + 'px' }"
                >
                    {{ step.title }}
                </span>
            </li>
        </ul>
    </div>
</template>

<style lang="scss" scoped>

.tob-list {
    opacity: 0.99;
    background-color: white;
    z-index: 1;
    height: 100%;
    display: flex;
    margin: 20px;

    ul.step-list {
        margin-top: 20px;
        align-self: flex-end;
        cursor: pointer;

        li {
            font-size: 1rem;
            padding: 10px;
        }
    }
}

</style>
