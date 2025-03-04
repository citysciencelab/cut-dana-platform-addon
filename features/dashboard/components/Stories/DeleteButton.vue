<script setup>

// import {useStories} from "../../../stories/hooks/useStories";
import {mdiTrashCanOutline} from "@mdi/js";

// const {currentStoryId} = useStories(),
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
    console.log(storyId, "delete");
}
</script>

<template>
    <v-tooltip top>
        <template #activator="{ on }">
            <v-icon
                id="delete-button"
                v-on="on"
                @click="deleteStoryWithConfirm()"
            >
                {{ mdiTrashCanOutline }}
            </v-icon>
        </template>
        <span>
            {{
                $t("additional:modules.tools.dataNarrator.creator.delete")
            }}
        </span>
    </v-tooltip>
</template>

