<script setup>
import {mdiPencil, mdiTrashCanOutline} from "@mdi/js";
import {useTranslation} from "i18next-vue";

import {useDataNarrator} from "../../../../hooks/useDataNarrator";
import * as constants from "../../../../store/contantsDataNarrator"
import {useStory} from "../../../stories/hooks/useStory";

const {t} = useTranslation();
const {currentStoryId} = useStory();
const {gotoPage} = useDataNarrator();
const {storyId} = defineProps({
    storyId: {
        type: String,
        required: true
    }
});

function gotoSelectedStory () {
    currentStoryId.value = storyId;
    gotoPage(constants.dataNarratorModes.EDIT_STORY);
}
</script>

<template>
    <v-tooltip location="top">
        <template #activator="{ props }">
            <v-btn
                v-bind="props"
                :icon="mdiPencil"
                variant="text"
                density="comfortable"
                @click="gotoSelectedStory"
            />
        </template>
        {{ t("additional:modules.dataNarrator.creator.edit") }}
    </v-tooltip>
</template>
