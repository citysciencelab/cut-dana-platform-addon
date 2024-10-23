<script>
import {
    mdiHelpCircleOutline, mdiPencilOutline, mdiClose
} from "@mdi/js";
import {mapActions, mapMutations} from "vuex";
import mutations from "../../store/mutationsDataNarrator";
import actions from "../../store/actionsDataNarrator";
import CoverSelector from "./inputs/CoverSelector.vue";

export default {
    name: "DataEditor",
    components: {CoverSelector},
    props: {
        step: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            icons: {
                mdiHelpCircleOutline,
                mdiClose,
                mdiPencilOutline
            },
            rawDatasources: this.editedStep?.datasources || [],
            datasources: [],
            wmsLayers: this.editedStep?.wmsLayers || [],
            allWmsLayers: []
        };
    },
    computed: {
        // Your computed properties go here
    },
    mounted () {
        // Your mounted lifecycle hook logic goes here
    },
    methods: {
        ...mapMutations("Modules/DataNarrator", Object.keys(mutations)),
        ...mapActions("Modules/DataNarrator", Object.keys(actions)),
        ...mapActions("Modules/FileImport", [
            "importKML",
            "setSelectedFiletype"
        ]),


        /**
         * Enables the 3D mode and opens the file upload form
         * @returns {void}
         */
        async open3DAndFileForm () {
            await this.activate3DMap(true);
            this.cesiumCamera().moveEnd.addEventListener(this.mapMovedHandler);

            this.step.navigation3D = this.get3DMapCenter();
            this.$emit(
                "openFileForm",
                this.step
            );
        },

        /**
         * Toggles the draw tool
         * @returns {void}
         */

        toggleDrawTool () {
            this.drawToolOpen = !this.drawToolOpen;
            this.$store.commit("Modules/Draw/setActive", this.drawToolOpen);
        },


        /**
         * Handle the custom data upload
         * @param {Event} event - The file input change event
         * @returns {void}
         */
        onCustomDataUpload (event) {
            this.datasources = event.target.files;
            if (this.datasources !== undefined) {
                this.addFile(this.datasources);
            }
        },


        /**
         * Removes the layer from the list of layers
         * @param {Object} model The model of the layer to remove
         * @returns {void}
         */
        removeDatasource (model) {
            this.rawDatasources = this.rawDatasources.filter(datasource => datasource.key !== model.key);
        },

        /**
         * Handle return back to the stepForm
         * @returns {void}
         */
        returnToStepForm () {
            this.$emit("return", this.step);
        },

        /**
         * Removes URL parameters from a URL since the function adds and handles those itself
         * @param {string} url the item to enable
         * @returns {string} the url without parameters
         */
        removeURLParameters (url) {
            const urlObj = new URL(url);

            return urlObj.origin + urlObj.pathname;
        },

        /**
         * Handles adding a WMS layer to the step
         * @returns {void}
         */
        async onWmsLayersAdd () {
            // Radio.trigger("Parser", "addWMSRemotely", document.querySelector("#own_wmsLayers").value);

            const url = this.removeURLParameters(document.querySelector("#own_wmsLayers").value),
                capabilites = await this.capabilityOptions(url),
                exists = this.wmsLayers.filter(layer => layer.url === url).length > 0;

            if (!exists) {

                this.wmsLayers.push({
                    url: url,
                    selectedLayers: []
                });

                this.allWmsLayers.push({
                    url: url,
                    selectedLayers: capabilites
                });

                this.importWMSLayers(url, capabilites);

            }
        },

        /**
         * Handles adding a capability to the WMS layers
         * @param {String} layerUrl the url where the layer should be
         * @param {String} capability the capability to add
         * @returns {void}
         */
        onWmsCapabilitiesUpdate (layerUrl, capability) {
            const layer = this.wmsLayers.find(url => url.url === layerUrl),
                allLayer = this.allWmsLayers.find(url => url.url === layerUrl);

            if (layer) {
                layer.selectedLayers.push(capability.Name);
            }

            if (allLayer) {
                allLayer.selectedLayers.push(capability);
            }
        },

        /**
         * Handles removing a capability from the WMS layers
         * @param {String} layerUrl the url where the layer should be
         * @param {String} capability the capability to remove
         * @returns {void}
         */
        onWmsCapabilitiesRemove (layerUrl, capability) {
            const layer = this.wmsLayers.find(url => url.url === layerUrl),
                allLayer = this.allWmsLayers.find(url => url.url === layerUrl);

            if (layer) {
                layer.selectedLayers = layer.selectedLayers.filter(cap => cap !== capability);
            }

            if (allLayer) {
                allLayer.selectedLayers = allLayer.selectedLayers.filter(cap => cap !== capability);
            }
        },


        /**
         * Handles removing a WMS layer from the step
         * @param {Object} layer The URL to remove
         * @returns {void}
         */
        onWmsLayerRemove (layer) {
            this.hideWmsLayer(layer.url);
            this.wmsLayers = this.wmsLayers.filter(l => l.url !== layer.url);
            this.allWmsLayers = this.allWmsLayers.filter(l => l.url !== layer.url);
        }
    }
};
</script>

<template>
    <div
        id="layer-editor"
    >
        <CoverSelector
            :back-button-msg="$t('additional:modules.tools.dataNarrator.button.backToStep')"
            @click="returnToStepForm"
        />

        <div class="form-group form-input-holder lg">
            <v-tooltip top>
                <template #activator="{ on }">
                    <label
                        class="form-label"
                        for="own_dataSource"
                        v-on="on"
                    >
                        {{ $t("additional:modules.tools.dataNarrator.label.ownDatasource") }}
                    </label>

                    <v-icon
                        dense
                        small
                        v-on="on"
                    >
                        {{ icons.mdiHelpCircleOutline }}
                    </v-icon>
                </template>
                <span>
                    {{ $t("additional:modules.tools.dataNarrator.dashboardView.description") }}
                </span>
            </v-tooltip>
            <v-expansion-panels
                id="step-layer"
                class="expansion-panels"
                dense
                nav
                elevation="1"
            >
                <v-expansion-panel
                    v-for="(item) in rawDatasources"
                    :key="item.key"
                    color="primary"
                >
                    <v-expansion-panel-header>
                        <v-list-item-title>{{ item.name }}</v-list-item-title>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-icon
                            color="grey lighten-1"
                            @click="removeDatasource(item)"
                        >
                            {{ icons.mdiClose }}
                        </v-icon>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
            <v-container>
                <v-row no-gutters>
                    <v-col cols="11">
                        <label
                            class="form-label"
                            for="own_dataSource"
                        />
                        <input
                            id="own_dataSource"
                            ref="own_dataSource_input"
                            type="file"
                            name="ownDataSource"
                            class="form-control"
                            accept=".kml, .geojson, .json, .gpx"
                            multiple
                            @change="onCustomDataUpload"
                        >
                    </v-col>
                    <v-col cols="1">
                        <v-tooltip top>
                            <template #activator="{ on }">
                                <v-icon
                                    class="ml-2 mr-1"
                                    v-on="on"
                                    @click="toggleDrawTool"
                                >
                                    {{ icons.mdiPencilOutline }}
                                </v-icon>
                            </template>
                            <span>
                                {{ $t("additional:modules.tools.dataNarrator.label.openDrawTool") }}
                            </span>
                        </v-tooltip>
                    </v-col>
                </v-row>
            </v-container>

            <label
                class="form-label"
                for="own_wmsLayers"
            >
                {{ $t("additional:modules.tools.dataNarrator.label.ownWmsLayers") }}
            </label>
            <v-expansion-panels
                id="step-layer"
                class="expansion-panels"
                dense
                nav
                elevation="1"
            >
                <v-expansion-panel
                    v-for="(item, index) in allWmsLayers"
                    :key="index"
                    color="primary"
                >
                    <v-expansion-panel-header>
                        <v-list-item-title>{{ item.url }}</v-list-item-title>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-treeview
                            :key="`wmsLayers${index}${key}`"
                            :selected="wmsLayers.map(({url, selectedLayers}) => url === item.url ? selectedLayers : [])"
                            selectable
                            :items="item.selectedLayers"
                            item-key="Name"
                            item-text="Title"

                            @input="updateSelectedCapabilities($event, item.url, item.selectedLayers)"
                        />
                        <!-- <WmsCapabilitiesSelector
                                        :items="capabilityOptions(item.url)"
                                        :selected.sync="item.selectedLayers"
                                    /> -->
                        <v-icon
                            color="grey lighten-1"
                            @click="onWmsLayerRemove(item)"
                        >
                            {{ icons.mdiClose }}
                        </v-icon>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
            <v-row>
                <v-col>
                    <input
                        id="own_wmsLayers"
                        ref="own_wmsLayers_input"
                        type="text"
                        name="ownWms"
                        class="form-control"
                        @change="onWmsLayersAdd"
                    >
                </v-col>
            </v-row>
        </div>

        <div class="form-group form-input-holder lg">
            <v-btn
                color="primary"
                @click="open3DAndFileForm"
            >
                {{ $t( "additional:modules.tools.dataNarrator.label.threeDFiles" ) }}
            </v-btn>
        </div>
    </div>
</template>

<style scoped lang="scss">
    #layer-editor {
        // Your styles go here
    }
</style>
