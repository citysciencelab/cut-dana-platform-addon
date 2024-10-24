import {defaultMap} from "../store/constantsDataNarrator";
import sortBy from "../../../../src/utils/sortBy";
import ThreeDUtilities from "./ThreeDUtilities.js";

export default {
    data () {
        return {
            layerTypes3DSpecific: ["Oblique", "Entities3D", "TileSet3D", "Terrain3D"]
        };
    },
    computed: {
        /**
         * All layer options
         * @returns {Object[]} layers to select
         */
        allLayerOptions () {
            const allLayers = Radio.request("Parser", "getItemsByAttributes", {type: "layer"}),
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
                if (layer.isBaseLayer) {
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

            return Radio.request("ModelList", "getModelByAttributes", {id: layerId});
        },

        getLayerModelByName (name) {
            return Radio.request("ModelList", "getModelByAttributes", {name: this.getLayerNameFromFile(name)});
        },


        /**
         * Toggles a layer on the map
         * @param {Object} layer the layer to enable
         * @param {Boolean} enabled enables the layer if `true`, disables the layer if `false`
         * @returns {void}
         */
        toggleLayer (layer, enabled) {
            if (layer) {
                layer.setIsVisibleInMap(enabled);
                layer.setIsSelected(enabled);
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

                this.toggleLayer(layer, false);
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
                let layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layer.id});
                const exists = items.filter(item => item.id === layer.id).length > 0 && layerModel;

                if (exists) {
                    if (!layerModel) {
                        Radio.trigger("ModelList", "addModelsByAttributes", layer);
                        layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layer.id});
                    }
                    layers.push(layerModel);
                }
            }
            return sortBy(layers, (model) => model.get("selectionIDX"), this).reverse();
        },

        enabledLayers () {
            return Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, isBaseLayer: false});
        },

        enabled3DLayers () {
            return Radio.request("ModelList", "getModelsByAttributes", {parentId: "3d_daten"});
        },

        enabledBackgroundLayers () {
            return Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, isBaseLayer: true});
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
                layerModel = this.getLayerById(layerId);

                if (!layerModel) {
                    const foundLayer = layerList.find(l => l.id === layerId);

                    // Somtimes, we don't have entire model, only ID
                    if (layerId !== layer) {
                        foundLayer.selectionIDX = layer.selectionIDX;
                        foundLayer.transparency = layer.transparency;
                    }

                    Radio.trigger("ModelList", "addModelsByAttributes", foundLayer);
                    layerModel = this.getLayerById(foundLayer);
                }
                this.enableLayer(layerModel);
            }
        },

        disableStoryLayers (story) {
            const layerList = this.enabledLayers();

            story?.steps?.forEach(step => this.disableStepLayers(step, layerList, true));
            Radio.trigger("Menu", "rerender");
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
                Radio.trigger("Menu", "rerender");
            }
        },

        setDefaultBackgroundLayer () {
            this.disableLayers(this.enabledBackgroundLayers());

            const defaultBackgroundMap = Radio.request("ModelList", "getModelByAttributes", {isBaseLayer: true, id: defaultMap});

            this.enableLayer(defaultBackgroundMap);
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
