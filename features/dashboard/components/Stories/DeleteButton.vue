<script setup>
import {mdiTrashCanOutline} from "@mdi/js";
import {useTranslation} from "i18next-vue";
import {ref} from "vue";

import {deleteStory} from "../../../stories/services/deleteStory";
import ConfirmationDialog from "../../../shared/ConfirmationDialog.vue";

const {t} = useTranslation();
const {storyId} = defineProps({
    storyId: {
        type: String,
        required: true
    }
});
const emit = defineEmits(['deleted']);
const isLoading = ref(false);
const deleteStoryDialogVisible = ref(false);

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
                @click="deleteStoryDialogVisible = true"
                variant="text"
                icon
                density="compact"
                :loading="isLoading"
            >
                <v-icon size="18" :icon="mdiTrashCanOutline"/>
            </v-btn>
        </template>
        {{ t("additional:modules.dataNarrator.creator.delete") }}
    </v-tooltip>

    <ConfirmationDialog
        :message="t('additional:modules.dataNarrator.confirm.deleteStory.description')"
        :title="t('additional:modules.dataNarrator.confirm.deleteStory.title')"
        :confirm-text="t('additional:modules.dataNarrator.confirm.deleteStory.confirmButton')"
        :cancel-text="t('additional:modules.dataNarrator.confirm.deleteStory.denyButton')"
        v-model="deleteStoryDialogVisible"
        @confirm="deleteStoryWithConfirm"
    />
</template>

