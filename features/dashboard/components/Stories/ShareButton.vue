<script setup>
import {useTranslation} from "i18next-vue";
import { mdiLink } from "@mdi/js";

const {t} = useTranslation();
const {storyId} = defineProps({
    storyId: {
        type: String,
        default: "share-story"
    }
});

function shareStory () {
    console.log("shareStory", storyId);
}
</script>

<template>
    <v-tooltip top>
        <template>
            <v-icon
                id="share-button"
                @click="shareStory"
            >
                {{ mdiLink }}
            </v-icon>
        </template>
        <span>
            {{
                t("additional:modules.dataNarrator.button.share")
            }}
        </span>
    </v-tooltip>
</template>

