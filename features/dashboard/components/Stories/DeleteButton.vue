<script setup>

// import {useStories} from "../../../stories/hooks/useStories";
import {mdiTrashCanOutline} from "@mdi/js";
import {useTranslation} from "i18next-vue";
import {useStoryForm} from "../../../stories/hooks/useStoryForm";

// const {currentStoryId} = useStories(),
const {deleteStory} = useStoryForm();
const {t} = useTranslation();
const {storyId} = defineProps({
    storyId: {
        type: String,
        required: true
    }
});

/**
 *
 */
function deleteStoryWithConfirm () {
    deleteStory(storyId);
}
</script>

<template>
    <v-tooltip top>
        <template #activator="{ on }">
            <v-icon
                id="delete-button"
                v-on="on"
                class="pill-button"
                @click="deleteStoryWithConfirm()"
            >
                {{ mdiTrashCanOutline }}
            </v-icon>
        </template>
        <span>
            {{
                t("additional:modules.tools.dataNarrator.creator.delete")
            }}
        </span>
    </v-tooltip>
</template>

