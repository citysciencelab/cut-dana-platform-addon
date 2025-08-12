<script setup>
import {mdiTrashCanOutline} from "@mdi/js";
import {useTranslation} from "i18next-vue";
import {ref} from "vue";

import {deleteStory} from "../../../stories/services/deleteStory";

const {t} = useTranslation();
const {storyId} = defineProps({
    storyId: {
        type: String,
        required: true
    }
});
const emit = defineEmits(['deleted']);
const isLoading = ref(false);

async function deleteStoryWithConfirm() {
    isLoading.value = true;
    try {
        await deleteStory(storyId);
        emit('deleted');
    } catch (error) {
        console.error(error);
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <v-tooltip location="top">
        <template v-slot:activator="{ props }">
            <v-btn
                v-bind="props"
                :icon="mdiTrashCanOutline"
                @click="deleteStoryWithConfirm"
                variant="text"
                density="comfortable"
                :loading="isLoading"
            />
        </template>
        {{ t("additional:modules.dataNarrator.creator.delete") }}
    </v-tooltip>
</template>

