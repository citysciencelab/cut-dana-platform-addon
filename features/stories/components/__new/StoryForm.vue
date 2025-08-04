<script setup>
import {mdiDotsVertical, mdiArrowLeft, mdiImagePlusOutline, mdiPlus} from "@mdi/js";
import {computed, ref, watch} from "vue";

import Chapter from "./Chapter.vue";

let chapterId = 0;
const chapters = ref([{ id: chapterId }]);

const selectedImage = ref(null);
const imagePreview = computed(() => {
    return selectedImage.value
        ? URL.createObjectURL(selectedImage.value)
        : null;
});

const addNewChapter = () => {
    chapters.value.push({ id: chapterId++ });
}
</script>

<template>
    <div class="story-form">
        <div :class="['story-form-top', { 'with-image': !!selectedImage }]">
            <v-toolbar
                :color="selectedImage ? 'white' : 'transparent'"
                size="compact"
                class="sticky-top"
                style="border-radius: 100px;padding: 0;"
            >
                <template #prepend>
                    <v-btn :icon="mdiArrowLeft" size="compact" class="mr-2" />

                    <v-text-field
                        id="title"
                        width="200"
                        variant="underlined"
                        placeholder="STORY NAME"
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
        </div>

        <div class="story-form-content">
            <Chapter v-for="chapter in chapters" :key="chapter.id" />

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
                <v-btn class="mr-2" variant="outlined" color="black">
                    PREVIEW
                </v-btn>
                <v-btn variant="flat" color="black">
                    PUBLISH
                </v-btn>
            </v-row>
        </v-container>
    </div>
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
