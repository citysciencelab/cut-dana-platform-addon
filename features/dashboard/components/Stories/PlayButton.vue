<script setup>

import {useStories} from "../../../stories/hooks/useStories";
import {mdiPlayOutline} from "@mdi/js";

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
function playStory () {
    currentStoryId.value = storyId;
}
</script>

<template>
    <v-tooltip top>
        <template #activator="{ on }">
            <v-btn
                dark
                rounded
                x-small
                @click="playStory()"
            >
                <v-icon
                    id="play-button"
                    color="white"
                    small
                    v-on="on"
                >
                    {{ mdiPlayOutline }}
                </v-icon>
            </v-btn>
        </template>
        <span>
            {{
                $t("additional:modules.dataNarrator.play")
            }}
        </span>
    </v-tooltip>
</template>

<style scoped lang="scss">
#play-button {
    float:right;
    color: #413FAB;
}
</style>
