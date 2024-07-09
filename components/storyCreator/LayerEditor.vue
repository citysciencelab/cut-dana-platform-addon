<script>
import LayerSelector from "./inputs/LayerSelector.vue";
import {mapActions, mapGetters, mapMutations} from "vuex";
import mutations from "../../store/mutationsDataNarrator";
import actions from "../../store/actionsDataNarrator";
import RenderUtilities from "../../mixins/RenderUtilities";
import LayerUtilities from "../../mixins/LayerUtilities";
import ThreeDUtilities from "../../mixins/ThreeDUtilities";
import {mdiCancel, mdiCheck, mdiEyeOutline} from "@mdi/js";

export default {
    name: "LayerEditor",
    components: {
        LayerSelector
    },
    mixins: [ThreeDUtilities, RenderUtilities, LayerUtilities],
    props: {
        step: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            icons: {
                mdiCancel,
                mdiCheck,
                mdiEyeOutline
            },
            initialLayerSelection: []
        };
    },
    computed: {
        ...mapGetters(["mobile"])
    },
    watch: {
        /**
         * Toggles map 3D layers according to the selection for the step
         * @param {Array} newSelectedLayerIds the selected layers
         * @returns {void}
         */
        "step.layers3D" (newSelectedLayerIds) {
            this.watchStepLayers3D(this.step, newSelectedLayerIds);
        },

        /**
         * Toggles map layers according to the selection for the step
         * @param {Array} newSelectedLayerIds the selected layers
         * @returns {void}
         */
        "step.layers" (newSelectedLayerIds) {
            this.watchStepLayers(this.step, newSelectedLayerIds);
        }
    },
    created () {
        this.rebuildLayers(this.step.layers, "allLayers");
        this.initialLayerSelection = [...this.step.layers];
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),

        /**
         * Handle return back to the stepForm
         * @returns {void}
         */
        returnToStepForm () {
            this.$emit("return", this.step);
        },
        /**
         * Handle return back to the stepForm after deleting the step
         * @returns {void}
         */
        returnToStepFormDelete () {
            this.step.layers = [...this.initialLayerSelection];
            this.rebuildLayers(this.step.layers, "allLayers");
            this.$emit("return", this.step);
        }
    }
};
</script>

<template>
    <div
        id="layer-editor"
    >
        <div class="form-group form-input-holder lg">
            <v-row>
                <v-col
                    cols="1"
                    class="d-flex align-self-center "
                >
                    <v-btn
                        v-if="step.associatedChapter"
                        class="story-step-button pill-button step-indicator"
                        :style="{color: colorFor(step.associatedChapter).main}"
                        icon
                        :title="
                            $t(
                                'additional:modules.tools.dataNarrator.label.stepNumber'
                            )
                        "
                    >
                        {{ step.stepNumber }}
                    </v-btn>
                </v-col>
                <v-col
                    cols="11"
                    class="d-flex align-self-center step-title-holder"
                >
                    <div id="step-title-mid">
                        {{ step.title }}
                    </div>
                </v-col>
            </v-row>
            <LayerSelector
                :items="allLayerOptions.plainLayers"
                :selected.sync="step.layers"
                legend="additional:modules.tools.dataNarrator.label.selectLayers"
            />

            <LayerSelector
                :items="allLayerOptions.layers3D"
                :selected.sync="step.layers3D"
                legend="additional:modules.tools.dataNarrator.label.selectLayers3D"
            />
        </div>

        <v-footer
            class="tool-dataNarrator-creator-actions white"
            elevation="2"
            rounded
        >
            <v-card
                v-if="!mobile"
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
                                    @click="returnToStepFormDelete"
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
                                id="save-button"
                                class="mr-1"
                                v-on="on"
                            >
                                <v-btn
                                    class=""
                                    icon
                                    @click="returnToStepForm"
                                >
                                    <v-icon size="24px">{{ icons.mdiCheck }}</v-icon>
                                </v-btn>
                            </span>
                        </template>
                        <span>
                            {{
                                $t('additional:modules.tools.dataNarrator.button.backToStep')
                            }}
                        </span>
                    </v-tooltip>
                </v-card-text>
            </v-card>
            <v-container
                v-else
                fluid
                class="white"
            >
                <v-row
                    class="mb-2"
                    no-gutters
                >
                    <v-col>
                        <v-btn
                            class=""
                            small
                            color="red"
                            min-width="100%"
                            @click="returnToStepFormDelete"
                        >
                            <span>
                                {{ $t("additional:modules.tools.dataNarrator.button.cancel") }}
                            </span>
                        </v-btn>
                    </v-col>
                    <v-col>
                        <v-btn
                            class=""
                            small
                            color="green"
                            @click="returnToStepForm"
                        >
                            <span>
                                {{
                                    $t('additional:modules.tools.dataNarrator.button.backToStep')
                                }}
                            </span>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-footer>
    </div>
</template>

<style scoped>
    #layer-editor {
        #step-title-mid{
            font-size: 15px;
            font-weight: bold;
            color: #403d3d;
        }
    }
</style>
