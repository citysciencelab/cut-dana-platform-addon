<script setup>
import {mdiDotsVertical, mdiArrowLeft, mdiImagePlusOutline, mdiPlus, mdiTrashCan} from "@mdi/js";
import {computed, ref, watch} from "vue";

import Chapter from "./Chapter.vue";
import {dataNarratorModes, ToolwindowModes} from "../../../../store/contantsDataNarrator";
import {useDataNarrator} from "../../../../hooks/useDataNarrator";
import {uploadCoverImage} from "../../services/addCoverImage";
import {createStory} from "../../services/createStory";
import Preview from "./preview/Preview.vue";
import {editStory} from "../../services/editStory";

const props = defineProps({
    storyId: Number,
    storyName: String,
    chapters: Array,
    storyLoading: Boolean,
});
const {toolwindowMode} = useDataNarrator();
const {gotoPage} = useDataNarrator();
const storyName = ref("");
const isSaving = ref(false);
const previewModal = ref(false);

let nextChapterId = 1;
const chapters = ref([
    {
        id: 0,
        sequence: 1,
        title: '',
        steps: [],
    }
]);

const selectedImage = ref(null);
const imagePreview = computed(() => {
    return selectedImage.value
        ? URL.createObjectURL(selectedImage.value)
        : null;
});

const addNewChapter = () => {
    chapters.value.push({
        id: nextChapterId++,
        sequence: chapters.value.length,
        title: '',
        steps: [],
    });
}

const publish = async () => {
    isSaving.value = true;

    const payload = {
        title: storyName.value,
        chapters: chapters.value
    };

    let storyId = props.storyId;
    if(storyId) {
        const updateResp = await editStory(storyId, payload);
        if (!updateResp.ok) throw new Error("Failed to edit story");
        await updateResp.json();
    } else {
        const createResp = await createStory(payload);
        if (!createResp.ok) throw new Error("Failed to create story");
        const newStory = await createResp.json();
        storyId = newStory.id;
    }

    if (selectedImage.value) {
        try {
            await uploadCoverImage(storyId, selectedImage.value);
        } catch (err) {
            console.error(err);
        }
    }

    isSaving.value = false;
    gotoPage(dataNarratorModes.DASHBOARD);
}

watch(
    [() => props.storyName, () => props.chapters, () => props.storyId],
    ([s, c, sId]) => {
        if(sId) {
            storyName.value = s;
            chapters.value = c;
        }
    },
    { immediate: true }
);
</script>

<template>
    <div
        v-if="props.storyLoading"
        :class="{ 'story-form': true, mobile: toolwindowMode === ToolwindowModes.MOBILE }"
    >
        <v-row>
            <v-col cols="12" class="p-0 pt-2">
                <v-skeleton-loader
                    type="article"
                ></v-skeleton-loader>
            </v-col>
        </v-row>
    </div>
    <form
        v-else
        @submit.prevent="publish"
        :class="{ 'story-form': true, mobile: toolwindowMode === ToolwindowModes.MOBILE }"
    >
        <div :class="['story-form-top', { 'with-image': !!selectedImage }]">
            <v-toolbar
                :color="selectedImage ? 'white' : 'transparent'"
                size="compact"
                class="sticky-top"
                style="border-radius: 100px;padding: 0;"
            >
                <template #prepend>
                    <v-btn
                        :icon="mdiArrowLeft"
                        size="compact"
                        class="mr-2"
                        @click="() => gotoPage(dataNarratorModes.DASHBOARD)"
                    />

                    <v-text-field
                        id="title"
                        width="200"
                        variant="underlined"
                        placeholder="STORY NAME"
                        v-model="storyName"
                        required
                    />

                    <v-file-input
                        class="ml-2"
                        :prepend-icon="mdiImagePlusOutline"
                        hide-input
                        accept="image/png, image/jpeg"
                        v-model="selectedImage"
                    />
                </template>

                <v-btn :icon="mdiDotsVertical" size="compact" />
            </v-toolbar>

            <img
                v-if="imagePreview"
                :src="imagePreview"
                alt="Selected preview"
                class="image-preview"
            />

            <div v-if="imagePreview" class="remove-image-btn">
                <v-btn
                    :icon="mdiTrashCan"
                    variant="flat"
                    density="comfortable"
                    @click="selectedImage = null"
                />
            </div>
        </div>

        <div class="story-form-content">
            <Chapter
                v-for="chapter in chapters"
                :key="chapter.id"
                :chapter="chapter"
            />

            <v-btn variant="plain" class="text-capitalize mt-2" @click="addNewChapter">
                <template #prepend>
                    <div class="add-chapter-button-icon">
                        <v-icon>{{ mdiPlus }}</v-icon>
                    </div>
                </template>
                Neues Kapitel
            </v-btn>
        </div>

        <v-container class="story-form-footer">
            <v-row justify="center">
                <v-btn
                    type="button"
                    class="mr-2"
                    variant="outlined"
                    color="black"
                    @click="previewModal = true"
                >
                    VORSCHAU
                </v-btn>
                <v-btn
                    type="submit"
                    variant="flat"
                    color="black"
                    :loading="isSaving"
                >
                    VERÖFFENTLICHEN
                </v-btn>
            </v-row>
        </v-container>

        <Preview :chapters="chapters" v-model:open="previewModal" />
    </form>
</template>

<style lang="scss">
.story-form {
    position: absolute;
    top: 90px;
    bottom: 90px;
    left: 20px;
    right: 0;
    background-color: #f6f6f6;
    box-shadow: 0 12px 30px -8px rgba(0,0,0,0.30);
    border-radius: .8rem;
    padding: 0 10px;
    display: flex;
    flex-direction: column;

    &.mobile {
        background-color: transparent;
        box-shadow: none;
        top: 30px;
        bottom: 10px;
        right: 10px;
        left: 10px;
    }

    .v-toolbar__content {
        height: 40px !important;
    }

    &-top {
        height: auto;
        margin-top: 10px;
        margin-bottom: 10px;
        position: relative;

        &.with-image {
            height: 260px;
            padding: 10px;
        }

        .image-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            border-radius: 20px;
        }

        .remove-image-btn {
            position: absolute;
            right: 10px;
            bottom: 10px;
        }
    }

    &-content {
        height: 100%;
        overflow-y: auto;

        .add-chapter-button-icon {
            border: 2px solid #584560;
            padding: 0 10px;
            border-radius: 20px;
            font-size: 16px;
            font-weight: bold;
            color: #584560;
            cursor: pointer;
        }
    }

    &-footer {
        margin-top: auto;
        background-color: #f6f6f6;
    }
}
</style>
