<script setup>
import {mdiDotsVertical, mdiArrowLeft, mdiImagePlusOutline, mdiTrashCan} from "@mdi/js";
import {computed, ref, watch} from "vue";

import Chapter from "./Chapter.vue";
import StoryOverview from "./StoryOverview.vue";
import {dataNarratorModes, ToolwindowModes} from "../../../../store/contantsDataNarrator";
import {useDataNarrator} from "../../../../hooks/useDataNarrator";
import {uploadCoverImage} from "../../services/addCoverImage";
import {createStory} from "../../services/createStory";
import {editStory} from "../../services/editStory";

const props = defineProps({
    storyId: Number,
    storyName: String,
    chapters: Array,
    storyLoading: Boolean,
    coverImageUrl: String,
});
const {toolwindowMode} = useDataNarrator();
const {gotoPage} = useDataNarrator();
const storyName = ref("");
const isSaving = ref(false);
const previewVisible = ref(false);
const activeChapterIndex = ref(0);
const activeStepIndex = ref(-1);

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
    if (selectedImage.value) return URL.createObjectURL(selectedImage.value);
    return props.coverImageUrl || null;
});

function addNewChapter() {
    const newChapter = {
        id: nextChapterId++,
        sequence: chapters.value.length + 1,
        title: '',
        steps: [],
    };

    chapters.value.push(newChapter);

    activeChapterIndex.value = chapters.value.length - 1;
    activeStepIndex.value = -1;
}

function handleAddNewStep() {
    const chapter = chapters.value[activeChapterIndex.value];
    activeStepIndex.value = chapter.steps.length - 1;
}

function handleDeleteStep({chapterIdx, stepIdx}) {
    const chapter = chapters.value?.[chapterIdx];
    if (!chapter) return;
    if (stepIdx < 0 || stepIdx >= chapter.steps.length) return;
    chapter.steps.splice(stepIdx, 1);
}

function handleReorderSteps({chapterIdx, newList}) {
    const chapter = chapters.value?.[chapterIdx];
    if (!chapter) return;
    chapter.steps = [...newList];
}

function handleEditStep({chapterIdx, stepIdx}) {
    activeChapterIndex.value = chapterIdx;
    activeStepIndex.value = stepIdx;
    previewVisible.value = false;
}

function handleEditChapter({chapterIdx}) {
    const chapter = chapters.value?.[chapterIdx];
    if (!chapter) return;
    previewVisible.value = false;
    activeChapterIndex.value = chapterIdx;
    const stepCount = chapters.value[chapterIdx].steps.length ?? 0;
    activeStepIndex.value = stepCount ? stepCount - 1 : -1;
}

function handleDeleteChapter({chapterIdx}) {
    if (chapterIdx < 0 || chapterIdx >= chapters.value.length) return;
    chapters.value.splice(chapterIdx, 1);
    chapters.value.forEach((ch, i) => (ch.sequence = i + 1));
}

async function publish() {
    isSaving.value = true;

    const payload = {
        title: String(storyName.value ?? '').trim(),
        chapters: chapters.value
    };

    let storyId = props.storyId;
    if (storyId) {
        const updateResp = await editStory(storyId, payload);
        const bodyText = await updateResp.text();
        if (!updateResp.ok) {
            throw new Error(`Failed to edit story: ${updateResp.status} ${bodyText}`);
        }
    } else {
        const createResp = await createStory(payload);
        const bodyText = await createResp.text();
        if (!createResp.ok) {
            throw new Error(`Failed to create story: ${createResp.status} ${bodyText}`);
        }
        const newStory = JSON.parse(bodyText);
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
        if (sId) {
            storyName.value = s;
            chapters.value = c ?? [];
        }
    },
    {immediate: true}
);
</script>

<template>
    <div
        v-if="false"
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
        <div :class="['story-form-top', { 'with-image': (!!selectedImage || !!imagePreview) }]">
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

                <v-btn :icon="mdiDotsVertical" size="compact"/>
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

        <div v-if="!previewVisible" class="story-form-content">
            <Chapter
                :key="chapters[activeChapterIndex]?.id ?? activeChapterIndex"
                :chapter="chapters[activeChapterIndex]"
                :activeStepIndex="activeStepIndex"
                @addNewChapter="addNewChapter"
                @addNewStep="handleAddNewStep"
            />
        </div>

        <StoryOverview
            v-else
            :chapters="chapters"
            @addNewChapter="() => {
                previewVisible = false;
                addNewChapter();
            }"
            @deleteStep="handleDeleteStep"
            @reorderSteps="handleReorderSteps"
            @editStep="handleEditStep"
            @editChapter="handleEditChapter"
            @deleteChapter="handleDeleteChapter"
        />

        <v-container class="story-form-footer">
            <v-row justify="center">
                <v-btn
                    type="button"
                    class="mr-2"
                    variant="outlined"
                    color="black"
                    @click="previewVisible = !previewVisible"
                >
                    VORSCHAU
                </v-btn>
                <v-btn
                    type="submit"
                    variant="flat"
                    color="black"
                >
                    VERÖFFENTLICHEN
                </v-btn>
            </v-row>
        </v-container>

        <!--        <Preview-->
        <!--            :chapters="chapters"-->
        <!--            :hasImage="!!selectedImage || !!imagePreview"-->
        <!--            v-model:open="previewModal"-->
        <!--        />-->
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
    box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.30);
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
