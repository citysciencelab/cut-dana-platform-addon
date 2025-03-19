<template>
    <v-btn
        rounded
        size="x-small"
        elevation="0"
        variant="text"
        :color="active ? 'info' : ''"
        @click="() => store.refetchStories(mode)"
    >
        {{ t(`additional:modules.dataNarrator.storyList.${mode}`) }}
    </v-btn>
</template>
<script setup>

import {useTranslation} from "i18next-vue";
import {useDashboard} from "../../hooks/useDashboard";

const store = useDashboard();

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
</script>
