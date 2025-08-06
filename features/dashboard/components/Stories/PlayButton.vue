<script setup>

import {useStories} from "../../../stories/hooks/useStories";
import {mdiPlayOutline} from "@mdi/js";
import {useTranslation} from "i18next-vue";

const {t} = useTranslation();
const {currentStoryId} = useStories();
const emit = defineEmits(["click"]);
const {storyId} = defineProps({
    storyId: {
        type: String,
        required: true
    }
});

function onClick() {
    emit('click');
}

</script>

<template>
    <v-btn
        color="black"
        rounded
        size="small"
        variant="flat"
        @click="onClick"
    >
        <v-icon
            id="play-button"
            color="white"
        >
            {{ mdiPlayOutline }}
            <v-tooltip activator="parent" location="top">
                {{ t("additional:modules.dataNarrator.play") }}
            </v-tooltip>
        </v-icon>
    </v-btn>
</template>

<style scoped lang="scss">
#play-button {
    float:right;
    color: #413FAB;
}
</style>
