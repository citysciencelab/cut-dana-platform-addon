<script setup>


import {ref} from "vue";
import {useTranslation} from "i18next-vue";
import {mdiAlphaXCircle, mdiImageRemoveOutline, mdiPanoramaVariantOutline} from "@mdi/js";
import BackButton from "./BackButton.vue";
import {useStoryForm} from "../../hooks/useStoryForm";

const {t} = useTranslation();

const hasCover = ref(false);
const showIcon = ref(false);
const storyCover = ref("");
const objectFile = ref("");


const {title} = useStoryForm();
</script>

<template>
    <div id="cover-selector">
        <div
            v-if="hasCover"
            class="form-input-holder xs"
            role="button"
            tabindex="0"
            @mouseover="showIcon = true"
            @mouseleave="showIcon = false"
            @focusin="showIcon = true"
            @focusout="showIcon = false"
        >
            <div id="cover-holder">
                <img
                    id="preview"
                    ref="preview_image"
                    class="preview_image"
                    :src="objectFile"
                    alt="your uploaded image"
                >
                <v-icon
                    v-show="showIcon"
                    id="hover-icon"
                    size="24px"
                    :title="t(
                        'additional:modules.dataNarrator.label.removeCover'
                    )"
                >
                    {{ mdiAlphaXCircle }}
                </v-icon>
            </div>
        </div>

        <div class="form-group">
            <v-row
                class="form-input-holder xs"
                :class="{ 'pt-3': hasCover }"
            >
                <v-col
                    cols="1"
                    class="d-flex align-self-center "
                >
                    <BackButton
                        tooltip="hi"
                        :show-story-title="false"
                        @click="$emit('back-click')"
                    />
                </v-col>
                <v-col
                    cols="9"
                    class="text-center title-holder"
                >
                    <v-text-field
                        id="title"
                        v-model="title"
                        class="vue-text-all-top"
                        :label="t(
                            'additional:modules.dataNarrator.label.storyUnnamed'
                        )"
                        :rules="''"
                        hide-details="auto"
                    />
                </v-col>

                <v-col
                    cols="1"
                    class="d-flex justify-center align-self-center"
                    :title="t(
                        'additional:modules.dataNarrator.label.addCover'
                    )"
                >
                    <v-file-input
                        id="cover"
                        ref="image_input"
                        class="cover-input"
                        :prepend-icon="mdiPanoramaVariantOutline"
                        hide-input
                        name="cover"
                        accept="image/png, image/jpeg"
                        v-model="storyCover"
                        @change="onCoverChange"
                    />
                </v-col>
                <v-col
                    cols="1"
                    class="d-flex justify-center align-self-center"
                    :title="t(
                        'additional:modules.dataNarrator.label.removeCover'
                    )"
                >
                    <v-icon size="24px">
                        {{ mdiImageRemoveOutline }}
                    </v-icon>
                </v-col>
            </v-row>
        </div>
    </div>
</template>

<style lang="scss">
#cover-selector {
    margin-bottom: 10px;

    #cover-holder {
        width: 100%;
        height: 150px
    }

    .cover-input {
        padding-top: 0;
        margin-top: 0;
    }

    #hover-icon {
        color: darkgray;
        height: 24px;
        width: 24px;
        position: absolute;
        right: 10px;
        top: 7px;
        background-color: white;
        border-radius: 10px;
    }

    #preview {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 15px
    }
}
</style>
