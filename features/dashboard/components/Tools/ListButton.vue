<script setup>

import {useTranslation} from "i18next-vue";
import {useDashboard} from "../../hooks/useDashboard";

const {storiesDisplayMode} = useDashboard();

const {t} = useTranslation();

const {mode, active} = defineProps({
    mode: {
        type: String,
        default: "all"
    },
    active: {
        type: Boolean,
        default: false
    }
});

const setMode = () => {
    storiesDisplayMode.value = mode;
};
</script>

<template>
    <v-btn
        rounded
        size="x-small"
        elevation="0"
        variant="text"
        :color="active ? 'info' : ''"
        @click="setMode"
    >
        {{ t(`additional:modules.dataNarrator.storyList.${mode}`) }}
    </v-btn>
</template>

