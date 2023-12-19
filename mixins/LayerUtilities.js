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
            const allLayers = Radio.request("Parser", "getItemsByAttributes", {type: "layer", isBaseLayer: false}),
                layers3D = [],
                plainLayers = [];

            allLayers.forEach(layer => {
                if (this.layerTypes3DSpecific.includes(layer.typ)) {
                    layers3D.push(layer);
                }
                else {
                    plainLayers.push(layer);
                }
            });
            return {layers3D, plainLayers, allLayers};
        }
    },
    methods: {
        disableLayers (layers) {
            layers.forEach(layer => this.disableLayer(layer));
        },

        enableLayers (layers) {
            layers.forEach(layer => this.enableLayer(layer));
        },

        disableLayersById (layers) {
            this.disableLayers(
                layers.map(layer => Radio.request("ModelList", "getModelByAttributes", {id: layer.toString()}))
            );
        },

        disableLayersByName (layers) {
            this.disableLayers(
                layers.map(layer => this.getLayerModelByName(layer))
            );
        },

        enableLayerByName (name) {
            this.disableLayer(this.getLayerModelByName(name));
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
       * @param {Object} layer the layer to disable
       * @returns {void}
       */
        disableLayer (layer) {
            this.toggleLayer(layer, false);
        },

        /**
         * Getting the layer name from the file name without the postfix as file format
         * @param {String} fileName name of the file
         * @returns {String} Returns the layer name
         */
        getLayerNameFromFile (fileName) {
            return fileName.split(".")[0];
        },

        rebuildLayers (selectedLayers) {
            const layerList = this.allLayerOptions.allLayers,
                enabledLayers = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, isBaseLayer: false});

            this.disableLayers(enabledLayers);

            for (const layer of selectedLayers) {
                let layerModel;
                const layerId = typeof layer === "string" ? layer : layer.id;

                // check if model is already in modelList
                layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layerId});

                if (!layerModel) {
                    const foundLayer = layerList.find(l => l.id === layerId);

                    // Somtimes, we don't have entire model, only ID
                    if (layerId !== layer) {
                        foundLayer.selectionIDX = layer.selectionIDX;
                        foundLayer.transparency = layer.transparency;
                    }

                    Radio.trigger("ModelList", "addModelsByAttributes", foundLayer);
                    layerModel = Radio.request("ModelList", "getModelByAttributes", {id: foundLayer.id});
                }
                this.enableLayer(layerModel);
            }

        }
    }
};
