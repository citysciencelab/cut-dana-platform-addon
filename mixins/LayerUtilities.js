import {defaultMap} from "../store/constantsDataNarrator";
import sortBy from "../../../../src/shared/js/utils/sortBy";
import ThreeDUtilities from "./ThreeDUtilities.js";
import appStore from "../../../../src/app-store";
import {mapActions} from "vuex";

export default {
    data () {
        return {
            layerTypes3DSpecific: ["Oblique", "Entities3D", "TileSet3D", "Terrain3D"]
        };
    },
    computed: {
        ...mapActions(["addLayerToLayerConfig", "layerConfigsByAttributes"]),
        ...mapActions("Alerting", ["addSingleAlert"]),

        /**
         * All layer options
         * @returns {Object[]} layers to select
         */
        allLayerOptions () {
            const allLayers = appStore.getters.layerConfigsByAttributes({type: "layer"}),
                layers3D = [],
                plainLayers = [],
                backgroundLayers = [];

            allLayers.forEach(layer => {
                if (this.layerTypes3DSpecific.includes(layer.typ)) {
                    layers3D.push(layer);
                }
                else {
                    plainLayers.push(layer);
                }
                if (layer.baselayer) {
                    backgroundLayers.push(layer);
                }
            });

            return {layers3D, plainLayers, allLayers, backgroundLayers};
        }
    },
    methods: {
        ...ThreeDUtilities.methods,

        disableLayers (layers) {
            layers.forEach(layer => this.disableLayer(layer));
        },

        enableLayers (layers) {
            layers.forEach(layer => this.enableLayer(layer));
        },

        disableLayersById (layers) {
            this.disableLayers(
                layers.map(layer => this.getLayerById(layer))
            );
        },

        disableLayersByName (layers) {
            this.disableLayers(
                layers.map(layer => this.getLayerModelByName(layer))
            );
        },

        enableLayerByName (name) {
            this.enableLayer(this.getLayerModelByName(name));
        },

        enableLayersById (layers) {
            this.enableLayers(
                layers.map(layer => this.getLayerById(layer))
            );
        },

        getLayerById (layer) {
            const layerId = typeof layer === "string" ? layer : layer.id;

            return appStore.getters.layerConfigById(layerId);
        },

        getLayerModelByName (name) {
            return appStore.getters.layerConfigsByAttributes({name: this.getLayerNameFromFile(name)});
        },


        /**
         * Toggles a layer on the map
         * @param {Object} layer the layer to enable
         * @param {Boolean} enabled enables the layer if `true`, disables the layer if `false`
         * @returns {void}
         */
        toggleLayer (layer, enabled) {
            if (layer) {
                layer.visibility = enabled;
                // layer.setIsSelected(enabled);
            }
        },

        /**
         * Enables a layer on the map
         * @param {Object} layer the layer to enable
         * @returns {void}
         */
        enableLayer (layer) {
            this.toggleLayer(layer, true);
        },

        /**
         * Disables a layer on the map
         * Disables a layer on the map
         * @param {Object} layer the layer to disable
         * @returns {void}
         */
        disableLayer (layer) {
            if (layer) {
                // hide 3D layers in 3D mode

                layer.visibility = false;
                if (this.layerTypes3DSpecific.includes(layer.attributes.typ)) {
                    // It doesn't work for 3D layers 🤷🏼
                    // const map = Radio.request("Map", "getMap3d");

                    // layer.layer.setVisible(false, map);
                    // console.log("hidden 3D layer", layer);

                }
            }
        },

        watchStepLayers3D (step, newSelectedLayerIds) {
            if (!step.is3D && newSelectedLayerIds.length !== 0) {
                this.activate3DMap(true);
            }
            else if (step.is3D && newSelectedLayerIds.length === 0) {
                this.activate3DMap(false);
            }

            this.rebuildLayers(newSelectedLayerIds, "layers3D");
        },

        watchStepLayers (step, newSelectedLayerIds) {
            this.rebuildLayers(newSelectedLayerIds, "plainLayers");
        },

        /**
         * Getting the layer name from the file name without the postfix as file format
         * @param {String} fileName name of the file
         * @returns {String} Returns the layer name
         */
        getLayerNameFromFile (fileName) {
            return fileName.split(".")[0];
        },

        getSelectedLayers (selected, items) {
            const layers = [];

            for (const layer of selected) {
                let layerModel = appStore.getters.layerConfigById(layer.id);
                const exists = items.filter(item => item.id === layer.id).length > 0 && layerModel;

                if (exists) {
                    if (!layerModel) {
                        layerModel = appStore.getters.layerConfigById(layer.id);
                        this.addLayer(layerModel);
                    }
                    layers.push(layerModel);
                }
            }
            return sortBy(layers, (model) => model.get("selectionIDX"), this).reverse();
        },

        enabledLayers () {
            return appStore.getters.layerConfigsByAttributes({isVisibleInMap: true, baselayer: false});
        },

        enabled3DLayers () {
            return appStore.getters.layerConfigsByAttributes({parentId: "3d_daten"});
        },

        enabledBackgroundLayers () {
            return appStore.getters.layerConfigsByAttributes({isVisibleInMap: true, baselayer: true});
        },

        enabledLayersWithMode (mode) {
            return this.enabledLayers().filter(layer => {
                return (mode === "allLayers") ||
                    (mode === "layers3D" && this.layerTypes3DSpecific.includes(layer.typ)) ||
                    (mode === "plainLayers" && !this.layerTypes3DSpecific.includes(layer.typ));
            });
        },

        rebuildLayers (selectedLayers, mode = "allLayers") {
            const layerList = this.allLayerOptions[mode];

            // TODO: check if we need to disable all layers
            this.disableLayers(this.enabledLayersWithMode(mode));

            for (const layer of selectedLayers) {
                let layerModel;
                const layerId = typeof layer === "string" ? layer : layer.id;

                // check if model is already in modelList
                if (!this.getLayerById(layerId)) {
                    const foundLayer = layerList.find(l => l.id === layerId);

                    // Somtimes, we don't have entire model, only ID
                    if (layerId !== layer) {
                        foundLayer.selectionIDX = layer.selectionIDX;
                        foundLayer.transparency = layer.transparency;
                    }

                    // TODO: eigentlich mit "treeSubjectsKey" this.addLayerToLayerConfig({layerConfig: foundLayer, parentKey: treeSubjectsKey})
                    this.addLayerToLayerConfig({layerConfig: foundLayer}).then((addedLayer) => {
                        if (addedLayer) {
                            this.addSingleAlert({
                                content: this.$t("common:modules.addWMS.completeMessage"),
                                category: "success",
                                title: this.$t("common:modules.addWMS.alertTitleSuccess")});
                            this.$refs.wmsUrl.value = "";
                            this.enableLayer(layerModel);
                        }
                        else {
                            this.addSingleAlert({
                                content: this.$t("common:modules.addWMS.alreadyAdded"),
                                category: "warning",
                                title: this.$t("common:modules.addWMS.errorTitle")});
                            this.$refs.wmsUrl.value = "";
                        }
                    });
                }
            }
        },

        disableStoryLayers (story) {
            const layerList = this.enabledLayers();

            story?.steps?.forEach(step => this.disableStepLayers(step, layerList, true));
            // Radio.trigger("Menu", "rerender");
        },

        disableStepLayers (step, layers = null, skipReRender = false) {
            const layerList = layers || this.enabledLayers();

            step?.layers?.forEach(layer => {
                const layerId = typeof layer === "string" ? layer : layer.id;

                this.disableLayer(layerList.find(l => l.attributes.id === layerId));
            });
            step?.layers3D?.forEach(layer => {
                const layerId = typeof layer === "string" ? layer : layer.id;

                this.disableLayer(layerList.find(l => l.attributes.id === layerId));
            });
            if (!skipReRender) {
                // Radio.trigger("Menu", "rerender");
            }
        },

        setDefaultBackgroundLayer () {
            this.disableLayers(this.enabledBackgroundLayers());

            const defaultBackgroundMap = this.layerConfigsByAttributes({baselayer: true});

            this.enableLayer(defaultBackgroundMap[0]);
        },

        disableBackgroundLayers () {
            this.disableLayers(this.enabledBackgroundLayers());
        },

        getSelectedBackgroundLayerIds () {
            return this.enabledBackgroundLayers().map(layer => layer.id);
        },

        async disable3DLayers () {
            for (const layer of this.enabled3DLayers()) {
                layer.setIsVisibleInMap(false);
                layer.setIsSelected(false);
            }
            // this.disableLayer(this.enabled3DLayers());
        }
    }
};
