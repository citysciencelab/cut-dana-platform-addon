<script>

import {
    mdiArrowLeft,
    mdiPanoramaVariantOutline,
    mdiImageRemoveOutline,
    mdiAlphaXCircle
} from "@mdi/js";
import {mapActions, mapGetters, mapMutations} from "vuex";
import mutations from "../../../store/mutationsDataNarrator";
import actions from "../../../store/actionsDataNarrator";
import getters from "../../../store/gettersDataNarrator";
import BackButton from "../../shared/BackButton.vue";
import RenderUtilities from "../../../mixins/RenderUtilities";
export default {
    name: "CoverSelector",
    components: {BackButton},
    mixins: [RenderUtilities],
    props: {
        backButtonMsg: {
            type: String,
            default: "additional:modules.tools.dataNarrator.button.backToStory"
        }
    },
    data () {
        return {
            hasCover: false,
            showIcon: false,
            objectFile: null,
            storyNameRules: [
                value => Boolean(value) || this.$t("additional:modules.tools.dataNarrator.warning.requiredFields"),
                value => (value && value.length >= 5) || this.$t("additional:modules.tools.dataNarrator.warning.requiredFieldMinCharacters")
            ],
            icons: {
                mdiArrowLeft,
                mdiPanoramaVariantOutline,
                mdiAlphaXCircle,
                mdiImageRemoveOutline
            }
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters))
    },
    mounted () {
        if (Object.hasOwn(this.currentStory, "titleImage") && this.currentStory.titleImage !== "") {
            if (this.currentStory.titleImage instanceof File) {
                this.objectFile = URL.createObjectURL(this.currentStory.titleImage);
            }
            else {
                this.objectFile = this.currentStory.titleImage;
            }
            this.hasCover = true;
        }
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),
        /**
         * Handle the cover image change
         * @param {Event} event - The file input change event
         * @returns {void}
         */
        onCoverChange (event) {
            const file = event;

            if (!file) {
                this.deleteImage();
            }
            else {
                this.objectFile = URL.createObjectURL(file);
                this.currentStory.titleImage = file;
                this.hasCover = true;
            }
        },

        /**
         * Delete the cover image
         * @returns {void}
         */
        deleteImage () {
            this.objectFile = null;
            this.currentStory.titleImage = "";
            this.hasCover = false;
        }
    }
};
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
                    :title="$t(
                        'additional:modules.tools.dataNarrator.label.removeCover'
                    )"
                    @click="deleteImage"
                >
                    {{ icons.mdiAlphaXCircle }}
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
                        :tooltip="backButtonMsg"
                        :show-story-title="false"
                        @click="$emit('click')"
                    />
                </v-col>
                <v-col
                    cols="9"
                    class="text-center title-holder"
                >
                    <v-text-field
                        id="title"
                        v-model="currentStory.title"
                        class="vue-text-all-top"
                        :label="$t(
                            'additional:modules.tools.dataNarrator.label.storyUnnamed'
                        )"
                        :rules="storyNameRules"
                        hide-details="auto"
                    />
                </v-col>

                <v-col
                    cols="1"
                    class="d-flex justify-center align-self-center"
                    :title="$t(
                        'additional:modules.tools.dataNarrator.label.addCover'
                    )"
                >
                    <v-file-input
                        id="cover"
                        ref="image_input"
                        class="cover-input"
                        :prepend-icon="icons.mdiPanoramaVariantOutline"
                        hide-input
                        name="cover"
                        accept="image/png, image/jpeg"
                        @change="onCoverChange"
                    />
                </v-col>
                <v-col
                    cols="1"
                    class="d-flex justify-center align-self-center"
                    :title="$t(
                        'additional:modules.tools.dataNarrator.label.removeCover'
                    )"
                >
                    <v-icon size="24px">
                        {{ icons.mdiImageRemoveOutline }}
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
