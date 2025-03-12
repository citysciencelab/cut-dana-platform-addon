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
    <v-tooltip top>
        <template #activator="{ on }">
            <v-icon
                id="edit-button"
                v-on="on"
                class="pill-button"
                @click="gotoSelectedStory()"
            >
                {{ mdiPencil }}
            </v-icon>
        </template>
        <span>
            {{
                t("additional:modules.dataNarrator.creator.edit")
            }}
        </span>
    </v-tooltip>
</template>
