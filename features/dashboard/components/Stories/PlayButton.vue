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
    <v-tooltip location="top">
        <template #activator="{ props }">
            <v-btn
                v-bind="props"
                color="black"
                rounded
                size="small"
                variant="flat"
                @click="onClick"
            >
                <v-icon id="play-button" color="white">
                    {{ mdiPlayOutline }}
                </v-icon>
            </v-btn>
        </template>
        {{ t("additional:modules.dataNarrator.play") }}
    </v-tooltip>
</template>

<style scoped lang="scss">
#play-button {
    float:right;
    color: #413FAB;
}
</style>
