<script setup>

import {useStories} from "../../../stories/hooks/useStories";
import {mdiPencil} from "@mdi/js";
import {useTranslation} from "i18next-vue";
import {useDataNarrator} from "../../../../hooks/useDataNarrator";
import * as constants from "../../../../store/contantsDataNarrator"
import {useStoryForm} from "../../../stories/hooks/useStoryForm";

const {t} = useTranslation();

const {storyId: currentStoryId} = useStoryForm();
const {gotoPage} = useDataNarrator();
const {storyId} = defineProps({
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
    gotoPage(constants.dataNarratorModes.CREATE_STORY);
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
