<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import {VueEditor} from "vue2-editor";
import * as constants from "../../store/constantsDataNarrator";
import getDataUrlFromFile from "../../utils/getDataUrlFromFile";
import getFileExtension from "../../utils/getFileExtension";
import {getHTMLContentReference, getStepReference} from "../../utils/getReference";
import actions from "../../store/actionsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import uuid from "uuid";
import {
    mdiCancel,
    mdiTrashCanOutline,
    mdiCheck,
    mdiPinOutline,
    mdiBackspaceOutline
} from "@mdi/js";


export default {
    name: "StepForm",

    components: {
        VueEditor
    },

    props: {
        // The initial values for a step to edit
        editedStep: {
            type: Object,
            default: null
        }
    },
    data () {
        return {
            constants,
            getDataUrlFromFile,
            getFileExtension,
            getStepReference,
            getHTMLContentReference,
            minStepWidth: 280,
            maxStepWidth: 1000,
            step: this.editedStep && Object.keys(this.editedStep).length > 0
                ? this.editedStep
                : {
                    ...constants.emptyStep,
                    _id: uuid.v4(),
                    stepWidth: this.$store.state.Tools.DataNarrator.initialWidth
                },
            newChapterTitle: "",
            images: this.$store.state.Tools.DataNarrator.htmlContentsImages[this.editedStep?._id] || [],
            is3DLayerActive: false,
            layerTypes3DSpecific: ["Entities3D", "TileSet3D", "Terrain3D"],
            mapMovedPosition: {
                cameraPosition: [
                    null,
                    null,
                    null
                ],
                heading: null,
                pitch: null
            },
            icons: {
                mdiCancel,
                mdiTrashCanOutline,
                mdiCheck,
                mdiPinOutline,
                mdiBackspaceOutline
            }
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),

        /**
         * All chapter numbers
         * @returns {Object[]} all chapter numbers
         */
        newChapterNumber () {
            let chapters = this.currentStory.chapters || [];

            if (chapters.length === 0) {
                return 1;
            }

            chapters = chapters.map(({chapterNumber}) => chapterNumber);
            return Math.max(...chapters) + 1;
        },

        /**
         * @returns {Boolean} Can the step be submitted?
         */
        isValid () {
            return this.step.html?.length > 0;
        },

        /**
         * All step numbers of the selected chapter
         * @returns {Object[]} all step numbers
         */
        allStepNumbers () {
            let steps = this.currentStory.steps || [];

            if (steps.length === 0) {
                return [1];
            }
            steps = steps.filter(
                ({associatedChapter}) => associatedChapter === this.step.associatedChapter
            );
            return Array.from({length: steps.length + 1}, (v, i) => i + 1);
        },

        /**
         * The chapter options
         * @returns {Object[]} chapter options (value and text)
         */
        chapterOptions () {
            const chapters = this.currentStory.chapters || [],
                chapterOptions = chapters.map(chapter => ({
                    value: chapter.chapterNumber,
                    text: chapter.chapterNumber + " - " + chapter.chapterTitle
                })),
                newChapterOption = {
                    value: this.newChapterNumber,
                    text: this.$t(
                        "additional:modules.tools.dataNarrator.newChapter"
                    )
                };

            return [...chapterOptions, newChapterOption];
        },

        /**
         * The layer options
         * @returns {Object[]} layers including id and name
         */
        layerOptions () {

            // const lL = rawLayerList.getLayerList();

            // lL.forEach(layer => {
            //     // add layer to
            //     if (layer.typ === "WMS") {
            //         // console.log(layer, layer.typ);
            //         // Radio.trigger("Parser", "addLayer", layer)
            //     }
            // })

            const layerList = Radio.request("Parser", "getItemsByAttributes", {type: "layer"});

            return layerList.map(layer => ({
                value: layer.id,
                text: layer.name
            }));
        },

        /**
         * The addon options
         * @returns {Object[]} available addons to activate
         */
        addonOptions () {
            const configuredAddons = this.$store.state.Tools.configuredTools;

            return configuredAddons
                .filter(addon => addon.key !== this.id)
                .map(addon => ({
                    value: addon.key,
                    text:
                        addon.component.name ||
                        addon.key
                }));
        }
    },
    watch: {
        /**
         * Applies the step width to the tool window
         * @param {Number} newStepWidth the new step width
         * @returns {void}
         */
        "step.stepWidth" (newStepWidth) {
            this.setInitialWidth(newStepWidth);
        },

        /**
         * Toggles map layers according to the selection for the step
         * @param {Array} newSelectedLayerIds the selected layers
         * @returns {void}
         */
        "step.layers" (newSelectedLayerIds) {
            const selectedLayerIds = newSelectedLayerIds.map(Number),
                layerList = Radio.request(
                    "ModelList",
                    "getModelsByAttributes",
                    {isVisibleInTree: true}
                );

            for (const layer of layerList) {
                if (
                    selectedLayerIds.includes(Number(layer.attributes.id)) &&
                    !layer.attributes.isVisibleInMap
                ) {
                    layer.setIsVisibleInMap(true);
                    layer.set("isSelected", true);
                }
                else if (
                    !selectedLayerIds.includes(Number(layer.attributes.id)) &&
                    layer.attributes.isVisibleInMap
                ) {
                    layer.setIsVisibleInMap(false);
                    layer.set("isSelected", false);
                }
            }

            this.is3DLayerActive = Radio.request(
                "ModelList",
                "getModelsByAttributes",
                {isVisibleInMap: true}
            ).filter(layer => {
                return this.layerTypes3DSpecific.includes(layer.attributes.typ);
            }).length > 0;

            Radio.trigger("Menu", "rerender");
        },

        /**
         * Toggles the addons according to the selection for the step
         * @param {Array} newSelectedAddonIds the new selected addons
         * @param {Array} oldSelectedAddonIds the previous selected addons
         * @returns {void}
         */
        "step.interactionAddons" (newSelectedAddonIds, oldSelectedAddonIds) {
            const configuredAddons = this.$store.state.Tools.configuredTools,

                // Hide unselected addons again
                unselectedAddons = oldSelectedAddonIds.filter(
                    addon => !newSelectedAddonIds.includes(addon)
                );

            unselectedAddons.forEach(addonId => {
                const addon = configuredAddons.find(
                    ({key}) => key === addonId
                );

                if (addon) {
                    const toolKey = addon.key.charAt(0).toUpperCase() + addon.key.slice(1);

                    this.$store.commit(
                        `Tools/${toolKey}/setActive`,
                        false
                    );
                }
            });

            // Show selected addons
            newSelectedAddonIds.forEach(addonId => {
                const addon = configuredAddons.find(
                    ({key}) => key === addonId
                );

                if (addon) {
                    const toolKey = addon.key.charAt(0).toUpperCase() + addon.key.slice(1);

                    this.$store.commit(
                        `Tools/${toolKey}/setActive`,
                        true
                    );
                }
            });
        }
    },
    mounted () {
        if (this.step.associatedChapter === null) {
            const diff = this.chapterOptions.length > 1 ? 2 : 1;

            this.step.associatedChapter = this.chapterOptions[this.chapterOptions.length - diff].value;
        }
        if (this.step.stepNumber === null) {
            this.step.stepNumber = this.allStepNumbers[this.allStepNumbers.length - 1];
        }

    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),
        // These application wide getters and setters can be found in 'src/modules/map/store'
        ...mapGetters("Maps", ["center", "zoom", "getMap3d"]),

        /**
         * Handles step width changes
         * @param {Event} event event fired by changing the input for stepWidth
         * @returns {void}
         */
        onChangeStepWidth (event) {
            this.step.stepWidth = Math.max(
                this.minStepWidth,
                Math.min(this.maxStepWidth, Number(event.target.value))
            );
        },

        /**
         * Handles adding an image to the HTML content images
         * @param {File} imageFile the image file to add
         * @param {Object} Editor the HTML editor instance
         * @param {number} cursorLocation the current cursor location in the HTML editor
         * @param {Function} resetUploader function to reset the uploader
         * @returns {void}
         */
        onAddImage (imageFile, Editor, cursorLocation, resetUploader) {
            const fileExtension = getFileExtension(imageFile);

            getDataUrlFromFile(imageFile).then(dataUrl => {
                this.images.push({dataUrl, fileExtension});
                // Add image to HTML content
                Editor.insertEmbed(cursorLocation, "image", dataUrl);
                // console.log("Image added to HTML content");
                resetUploader();
            }).catch((error) => {
                console.error(error);
                Radio.trigger("Alert", "alert", {
                    text: i18next.t(
                        "additional:modules.tools.dataNarrator.error.errorAddingImage"
                    ),
                    category: "Error",
                    kategorie: "alert-danger"
                });
            });
        },

        /**
         * Handles removing and image from the HTML content
         * @param {String} imageDataUrl the image data url to remove
         * @returns {void}
         */
        onRemoveImage (imageDataUrl) {
            this.images = this.images.filter(
                image => image.dataUrl !== imageDataUrl
            );
        },

        /**
         * Shows confirmation dialog
         * Deletes the step from the story if confirmed
         * @returns {void}
         */
        onDeleteStep () {
            /**
             * Constant that saves all the actions on confirm
             * @returns {void}
             */
            const deleteStep = () => {
                const {associatedChapter, stepNumber} =
                    this.editedStep || this.step;

                this.deleteStoryStep({step: this.step});
                this.adjustStepNumbers({associatedChapter, stepNumber});
                this.$emit("return");
            };

            this.$emit("confirm", "deleteStep", deleteStep);
        },

        /**
         * Adds the created step to the story
         * or saves the step changes when in editing mode
         * @returns {void}
         */
        async onSubmit () {
            if (this.step.associatedChapter === this.newChapterNumber) {
                // Add a new chapter to the story
                this.addStoryChapter({
                    chapterNumber: this.newChapterNumber,
                    chapterTitle: this.newChapterTitle
                });
            }
            this.saveStoryStep({step: this.step, images: this.images});

            // Trigger submit action to return to story overview
            this.$emit("return");
        },

        /**
         * Transform a lon lat position to radians
         * @param {Object} cartesian3Pos a position defined by longitude, latitude, and height.
         * @returns {number} value in the resulting object will be in radians
         */
        toDegrees (cartesian3Pos) {
            const pos = Cesium.Cartographic.fromCartesian(cartesian3Pos);

            return [pos.longitude / Math.PI * 180, pos.latitude / Math.PI * 180, pos.height];
        },

        /**
         * 3D map center (should be implement in 3DMapRadioBridge)
         * @returns {Object} returns object in the format of the story attribute 'navigation3D'
         */
        get3DMapCenter () {
            const camera = Radio.request("Map", "getMap3d").getCesiumScene().camera;

            return {
                "cameraPosition": this.toDegrees(camera.position),
                "heading": camera.heading,
                "pitch": camera.pitch
            };
        },

        /**
         * Toggles 3D map mode via checkbox
         * @param {boolean} checkboxValue the flag indicating if 3D map should be activated
         * @returns {void}
         */
        async activate3DMap (checkboxValue) {
            this.step.is3D = checkboxValue;
            if (this.step.is3D && !Radio.request("Map", "isMap3d")) {
                await this.$store.dispatch("Maps/activateMap3D");

                Radio.request("Map", "getMap3d").getCesiumScene().camera.moveEnd.addEventListener(this.mapMovedHandler);
            }
            else if (!this.step.is3D && Radio.request("Map", "isMap3d")) {
                await this.$store.dispatch("Maps/deactivateMap3D");
            }
        },

        /**
         * Set new position of the camera after it stopped moving
         * @returns {void}
         */
        mapMovedHandler () {
            this.mapMovedPosition = this.get3DMapCenter();
        },

        /**
         * Complex check for the form warning of new camera position
         * @returns {void}
         */
        isCameraPositionDifferent () {
            return this.step.navigation3D.cameraPosition[0] && this.mapMovedPosition.cameraPosition[0]
                && (this.step.navigation3D.cameraPosition[0] !== this.mapMovedPosition.cameraPosition[0]
                    || this.step.navigation3D.cameraPosition[0] !== this.mapMovedPosition.cameraPosition[0]
                    || this.step.navigation3D.cameraPosition[0] !== this.mapMovedPosition.cameraPosition[0]);
        }
    }
};
</script>

<template lang="html">
    <div
        id="tool-dataNarrator-creator-stepForm"
        class="mb-8"
    >
        <h4>
            {{
                $t("additional:modules.tools.dataNarrator.createStoryStep")
            }}
        </h4>

        <form @submit.prevent="onSubmit">
            <div class="form-group">
                <label
                    class="form-label required"
                    for="step-associate"
                >
                    {{
                        $t(
                            "additional:modules.tools.dataNarrator.label.chapter"
                        )
                    }}
                </label>

                <v-select
                    id="step-associate"
                    v-model="step.associatedChapter"
                    :items="chapterOptions"
                    required
                    dense
                    solo
                    hide-details
                />
            </div>

            <div
                v-if="step.associatedChapter === newChapterNumber"
                class="form-group"
            >
                <label
                    class="form-label required"
                    for="step-chapter-title"
                >
                    {{
                        $t(
                            "additional:modules.tools.dataNarrator.label.newChapterTitle"
                        )
                    }}
                </label>

                <input
                    id="step-chapter-title"
                    v-model="newChapterTitle"
                    class="form-control"
                    required
                >
            </div>

            <div class="form-group">
                <label
                    class="form-label required"
                    for="step-number"
                >
                    {{
                        $t(
                            "additional:modules.tools.dataNarrator.label.stepNumber"
                        )
                    }}
                </label>
                <v-select
                    id="step-number"
                    v-model="step.stepNumber"
                    :items="allStepNumbers"
                    required
                    dense
                    solo
                    hide-details
                />

                <!-- <input
                    id="step-number"
                    class="form-control"
                    type="number"
                    :value="step.stepNumber"
                    min="1"
                    required
                    @change="onChangeStepNumber"
                >
                <p
                    v-if="
                        allStepNumbers.includes(step.stepNumber) &&
                            (!editedStep ||
                                step.stepNumber !== editedStep.stepNumber)
                    "
                    class="text-danger"
                >
                    <small>
                        {{
                            $t(
                                "additional:modules.tools.dataNarrator.error.stepNumberAlreadyExists"
                            )
                        }}
                    </small>
                </p> -->
            </div>

            <div class="form-group">
                <label
                    class="form-label required"
                    for="step-title"
                >
                    {{ $t("additional:modules.tools.dataNarrator.label.stepTitle") }}
                </label>

                <input
                    id="step-title"
                    v-model="step.title"
                    class="form-control"
                    required
                >
            </div>

            <div class="form-group">
                <label
                    class="form-label"
                    for="step-width"
                >
                    {{ $t("additional:modules.tools.dataNarrator.label.stepWidth") }}
                </label>

                <input
                    id="step-width"
                    class="form-control"
                    type="number"
                    :value="step.stepWidth"
                    :min="minStepWidth"
                    :max="maxStepWidth"
                    step="10"
                    @change="onChangeStepWidth"
                >
            </div>

            <div class="form-group">
                <label
                    class="form-label"
                    for="step-visible"
                >
                    {{ $t( "additional:modules.tools.dataNarrator.label.visible" ) }}
                </label>

                <input
                    id="step-visible"
                    class="checkbox"
                    type="checkbox"
                    :checked="step.visible"
                    @change="step.visible = $event.target.checked"
                >
            </div>

            <div
                v-if="is3DLayerActive"
                class="form-group"
            >
                <label
                    class="form-label"
                    for="step-is3d"
                >
                    {{ $t( "additional:modules.tools.dataNarrator.label.is3D" ) }}
                </label>
                <input
                    id="step-is3d"
                    class="checkbox"
                    type="checkbox"
                    :checked="step.is3D"
                    @change="activate3DMap($event.target.checked)"
                >
            </div>

            <div
                v-if="step.is3D"
                class="form-group"
            >
                <label
                    class="form-label"
                    for="step-3d-center"
                >
                    {{ $t( "additional:modules.tools.dataNarrator.label.centerCoordinate3D" ) }}
                </label>
                <div
                    class="stepForm-inputs-centerCoordinate stepForm-inputs-3d-position"
                >
                    <input
                        id="step-3d-center"
                        class="form-control"
                        :value="
                            step.navigation3D.cameraPosition[0]
                        "
                        readonly
                    >
                    <input
                        class="form-control"
                        :value="
                            step.navigation3D.cameraPosition[1]
                        "
                        readonly
                    >
                    <input
                        class="form-control"
                        :value="
                            step.navigation3D.cameraPosition[2]
                        "
                        readonly
                    >

                    <div class="input-group">
                        <button
                            type="button"
                            class="btn"
                            @click="step.navigation3D.cameraPosition = get3DMapCenter()['cameraPosition']"
                        >
                            <v-icon>{{ icons.mdiPinOutline }}</v-icon>
                        </button>
                        <button
                            type="button"
                            class="btn"
                            @click="step.navigation3D.cameraPosition = null"
                        >
                            <v-icon>backspace</v-icon>
                        </button>
                    </div>
                </div>
                <p
                    v-if="isCameraPositionDifferent()"
                    class="text-warning"
                >
                    <small>
                        {{ $t( "additional:modules.tools.dataNarrator.warning.mapMoved" ) }}
                    </small>
                </p>
            </div>
            <div
                v-if="step.is3D"
                class="form-group"
            >
                <label
                    class="form-label"
                    for="step-3d-heading"
                >
                    {{ $t( "additional:modules.tools.dataNarrator.label.heading" ) }}
                </label>

                <div
                    class="stepForm-inputs-centerCoordinate stepForm-3d-others"
                >
                    <input
                        id="step-3d-heading"
                        class="form-control"
                        :value="
                            step.navigation3D.heading
                        "
                        readonly
                    >
                    <div class="input-group">
                        <button
                            type="button"
                            class="btn"
                            @click="step.navigation3D.heading = get3DMapCenter()['heading']"
                        >
                            <v-icon>{{ icons.mdiPinOutline }}</v-icon>
                        </button>
                        <button
                            type="button"
                            class="btn"
                            @click="step.navigation3D.heading = null"
                        >
                            <v-icon>backspace</v-icon>
                        </button>
                    </div>
                </div>
                <p
                    v-if="
                        mapMovedPosition.heading && step.navigation3D.heading &&
                            step.navigation3D.heading !== mapMovedPosition.heading "
                    class="text-warning"
                >
                    <small>
                        {{ $t( "additional:modules.tools.dataNarrator.warning.mapMoved" ) }}
                    </small>
                </p>
            </div>
            <div
                v-if="step.is3D"
                class="form-group"
            >
                <label
                    class="form-label"
                    for="step-3d-pitch"
                >
                    {{ $t( "additional:modules.tools.dataNarrator.label.pitch" ) }}
                </label>
                <div
                    class="stepForm-inputs-centerCoordinate stepForm-3d-others"
                >
                    <input
                        id="step-3d-pitch"
                        class="form-control"
                        :value="
                            step.navigation3D.pitch
                        "
                        readonly
                    >

                    <div class="input-group">
                        <button
                            type="button"
                            class="btn"
                            @click="step.navigation3D.pitch = get3DMapCenter()['pitch']"
                        >
                            <v-icon>add_circle</v-icon>
                        </button>
                        <button
                            type="button"
                            class="btn"
                            @click="step.navigation3D.pitch = null"
                        >
                            <v-icon>backspace</v-icon>
                        </button>
                    </div>
                </div>
                <p
                    v-if="
                        mapMovedPosition.pitch && step.navigation3D.pitch &&
                            step.navigation3D.pitch !== mapMovedPosition.pitch"
                    class="text-warning"
                >
                    <small>
                        {{ $t( "additional:modules.tools.dataNarrator.warning.mapMoved" ) }}
                    </small>
                </p>
            </div>

            <div
                v-if="!step.is3D"
                class="form-group"
            >
                <label
                    class="form-label"
                    for="step-center"
                >
                    {{ $t( "additional:modules.tools.dataNarrator.label.centerCoordinate" ) }}
                </label>

                <div class="stepForm-inputs-centerCoordinate">
                    <input
                        id="step-center"
                        class="form-control"
                        :value="
                            step.centerCoordinate && step.centerCoordinate[0]
                        "
                        readonly
                    >
                    <input
                        class="form-control"
                        :value="
                            step.centerCoordinate && step.centerCoordinate[1]
                        "
                        readonly
                    >

                    <div class="input-group d-flex justify-content-center">
                        <v-tooltip top>
                            <template #activator="{ on }">
                                <v-icon
                                    class="ml-2 mr-1"
                                    v-on="on"
                                    @click="step.centerCoordinate = center()"
                                >
                                    {{ icons.mdiPinOutline }}
                                </v-icon>
                            </template>
                            <span>
                                {{ $t("additional:modules.tools.dataNarrator.label.centerCoordinate") }}
                            </span>
                        </v-tooltip>
                        <v-tooltip top>
                            <template #activator="{ on }">
                                <v-icon
                                    class="ml-2 mr-1"
                                    v-on="on"
                                    @click="step.centerCoordinate = null"
                                >
                                    {{ icons.mdiBackspaceOutline }}
                                </v-icon>
                            </template>
                            <span>
                                {{ $t("additional:modules.tools.dataNarrator.label.centerCoordinate") }}
                            </span>
                        </v-tooltip>
                    </div>
                </div>
                <p
                    v-if="step.centerCoordinate && step.centerCoordinate !== center() "
                    class="text-warning"
                >
                    <small>
                        {{ $t( "additional:modules.tools.dataNarrator.warning.mapMoved" ) }}
                    </small>
                </p>
            </div>

            <div
                v-if="!step.is3D"
                class="form-group"
            >
                <label
                    class="form-label"
                    for="step-zoom"
                >
                    {{ $t( "additional:modules.tools.dataNarrator.label.zoomLevel" ) }}
                </label>

                <div class="stepForm-inputs-zoomLevel">
                    <input
                        id="step-zoom"
                        class="form-control"
                        :value="step.zoomLevel"
                        readonly
                    >

                    <div class="input-group d-flex justify-content-center">
                        <v-tooltip top>
                            <template #activator="{ on }">
                                <v-icon
                                    class="ml-2 mr-1"
                                    v-on="on"
                                    @click="step.zoomLevel = zoom()"
                                >
                                    {{ icons.mdiPinOutline }}
                                </v-icon>
                            </template>
                            <span>
                                {{ $t("additional:modules.tools.dataNarrator.label.zoomLevel") }}
                            </span>
                        </v-tooltip>
                        <v-tooltip top>
                            <template #activator="{ on }">
                                <v-icon
                                    class="ml-2 mr-1"
                                    v-on="on"
                                    @click="step.zoomLevel = null"
                                >
                                    {{ icons.mdiBackspaceOutline }}
                                </v-icon>
                            </template>
                            <span>
                                {{ $t("additional:modules.tools.dataNarrator.label.zoomLevel") }}
                            </span>
                        </v-tooltip>
                    </div>
                </div>
                <p
                    v-if="step.zoomLevel !== null && step.zoomLevel !== zoom()"
                    class="text-warning"
                >
                    <small>
                        {{ $t( "additional:modules.tools.dataNarrator.warning.mapZoomed" ) }}
                    </small>
                </p>
            </div>

            <div class="form-group">
                <label
                    class="form-label"
                    for="step-layer"
                >
                    {{ $t( "additional:modules.tools.dataNarrator.label.layers" ) }}
                </label>

                <v-select
                    id="step-layer"
                    v-model="step.layers"
                    :items="layerOptions"
                    multiple
                    dense
                    solo
                    hide-details
                />
            </div>

            <div class="form-group">
                <label
                    class="form-label"
                    for="step-addons"
                >
                    {{ $t( "additional:modules.tools.dataNarrator.label.interactionAddons" ) }}
                </label>

                <v-select
                    id="step-addons"
                    v-model="step.interactionAddons"
                    :items="addonOptions"
                    multiple
                    dense
                    solo
                    hide-details
                />
            </div>

            <div class="form-group">
                <label
                    class="form-label required"
                    for="step-vue-editor"
                >
                    {{ $t( "additional:modules.tools.dataNarrator.label.htmlContent" ) }}
                </label>

                <div class="stepForm-inputs-htmlEditor">
                    <VueEditor
                        id="step-vue-editor"
                        v-model="step.html"
                        :editor-toolbar="constants.htmlEditorToolbar"
                        use-custom-image-handler
                        @image-added="onAddImage"
                        @image-removed="onRemoveImage"
                    />
                </div>
            </div>

            <v-footer
                class="tool-dataNarrator-creator-actions"
                :padless="true"
            >
                <v-card
                    flat
                    tile
                    width="100%"
                    class="lighten-1 text-center"
                >
                    <v-card-text>
                        <v-tooltip top>
                            <template #activator="{ on }">
                                <span
                                    id="cancel-button"
                                    class="mr-1"
                                    v-on="on"
                                >
                                    <v-btn
                                        class=""
                                        icon
                                        @click="$emit('return')"
                                    >
                                        <v-icon size="24px">{{ icons.mdiCancel }}</v-icon>
                                    </v-btn>

                                </span>
                            </template>
                            <span>
                                {{ $t("additional:modules.tools.dataNarrator.button.cancel") }}
                            </span>
                        </v-tooltip>
                        <v-tooltip top>
                            <template #activator="{ on }">
                                <span
                                    id="delete-button"
                                    class="mr-1"
                                    v-on="on"
                                >
                                    <v-btn
                                        class=""
                                        icon
                                        @click="onDeleteStep"
                                    >
                                        <v-icon size="24px">{{ icons.mdiTrashCanOutline }}</v-icon>
                                    </v-btn>
                                </span>
                            </template>
                            <span>
                                {{ $t("additional:modules.tools.dataNarrator.button.deleteStep") }}
                            </span>
                        </v-tooltip>
                        <v-tooltip top>
                            <template #activator="{ on }">
                                <span
                                    id="save-button"
                                    class="mr-1"
                                    v-on="on"
                                >
                                    <v-btn
                                        class=""
                                        icon
                                        :disabled="!isValid"
                                        @click="onSubmit"
                                    >
                                        <v-icon size="24px">{{ icons.mdiCheck }}</v-icon>
                                    </v-btn>

                                </span>
                            </template>
                            <span>
                                {{
                                    $t(editedStep
                                        ? "additional:modules.tools.dataNarrator.button.submitEditStep"
                                        : "additional:modules.tools.dataNarrator.button.submitAddStep")
                                }}
                            </span>
                        </v-tooltip>
                    </v-card-text>
                </v-card>
            </v-footer>
            <v-alert
                v-show="!isValid"
                type="info"
            >
                {{ $t("additional:modules.tools.dataNarrator.warning.sendNoHTML") }}
            </v-alert>
        </form>
    </div>
</template>

<style lang="scss" scoped>

#heroicon {
    width: 1.5rem;
    height: 1.5rem;
}
#tool-dataNarrator-creator-stepForm {
    max-width: 460px;

    &::v-deep {
        .v-text-field.v-text-field--enclosed:not(.v-text-field--rounded)
        > .v-input__control
        > .v-input__slot {
            margin: 0;
            padding: 0 0 0 0.3125rem;
        }

        .v-text-field.v-text-field--solo:not(.v-text-field--solo-flat)
        > .v-input__control
        > .v-input__slot {
            height: 34px;
            height: 34px;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 0;
            box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
        }

        .v-text-field.v-text-field--solo.v-input--is-focused:not(.v-text-field--solo-flat)
        > .v-input__control
        > .v-input__slot {
            border-color: #66afe9;
            outline: 0;
            box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.08),
            0 0 8px rgba(102, 175, 233, 0.6);
        }
    }

    label.required:after { content: '*';color:red; }

    .stepForm-inputs-centerCoordinate {
        display: grid;
        grid-template-columns: 1fr 1fr 100px;
        grid-gap: 5px;
        align-items: end;
    }

    .stepForm-3d-others {
        grid-template-columns: 1fr 1fr !important;
    }

    .stepForm-inputs-3d-position {
        grid-template-columns: 1fr 1fr 1fr 1fr !important;
    }

    .stepForm-inputs-zoomLevel {
        display: grid;
        grid-template-columns: 1fr 100px;
        grid-gap: 5px;
        align-items: end;
    }

    .stepForm-inputs-htmlEditor {
        background: "#fff";
    }
}
</style>
