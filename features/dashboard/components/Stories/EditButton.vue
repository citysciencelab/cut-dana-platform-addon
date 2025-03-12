<script setup>

import {useStories} from "../../../stories/hooks/useStories";
import {mdiPencil} from "@mdi/js";
import {useTranslation} from "i18next-vue";

const {t} = useTranslation();

const {currentStoryId} = useStories(),
    {storyId} = defineProps({
        storyId: {
            type: String,
            required: true
        }
    });

/**
 *
 */
function gotoSelectedStory () {
    currentStoryId.value = storyId;
}
</script>

<template>
    <v-icon
        id="edit-button"
        @click="gotoSelectedStory()"
    >
        {{ mdiPencil }}
        <v-tooltip activator="parent" location="top">
            {{ t("additional:modules.dataNarrator.creator.edit") }}
        </v-tooltip>
    </v-icon>
</template>
