<script setup>
import { mdiArrowLeft } from "@mdi/js";
import {useTranslation} from "i18next-vue";

const {t} = useTranslation();

const {tooltip, text, showStoryTitle} = defineProps({
    tooltip: {
        type: String,
        default: "additional:modules.tools.dataNarrator.button.backToStory"
    },
    text: {
        type: String,
        default: "additional:modules.tools.dataNarrator.button.backToStep"
    },
    showStoryTitle: {
        type: Boolean,
        default: true
    }
})
</script>

<template>
    <span>
        <span
            role="button"
            tabindex="0"
        >
            <v-tooltip left>
                <template #activator="{ on, attrs }">
                    <v-icon
                        v-bind="attrs"
                        v-on="on"
                        @click="$emit('click')"
                        @keydown="$emit('click')"
                    >
                        {{ mdiArrowLeft }}
                    ></v-icon>
                </template>
                <span>{{ t(tooltip) }}</span>
            </v-tooltip>
        </span>
        <span
            v-if="showStoryTitle"
            class="story-title"
        >
            {{ t(text) }}
        </span>
    </span>
</template>

<style lang="scss" scoped>
.v-icon {
    cursor: pointer;
}

.story-title {
    position: relative;
    top: 2px;
    font-weight: bold;
    font-size: 1.2em;
    margin-left: 10px;
}

.story-title, .chapter-title {
}
</style>
