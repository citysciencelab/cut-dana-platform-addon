
export default {

    computed: {
        // Computed property to get the value from Vuex store
        is3D () {
            return Radio.request("Map", "isMap3d");
        },

        isCesiumAvailable () {
            const cesiumInstance = Radio.request("Map", "getMap3d");
            return !!cesiumInstance; // Convert to boolean: true if enabled, false otherwise
        },

        cesiumMap () {
            return Radio.request("Map", "getMap3d");
        },

        cesiumScene () {
            return Radio.request("Map", "getMap3d").getCesiumScene();
        },

        cesiumCamera () {
            return Radio.request("Map", "getMap3d").getCamera().cam_;

        }
    },
    methods: {

        /**
         * Enables the 3d mode
         * @param params String some string for debugging
         * @returns {void}
         */
        async enable3D (params) {
            // makes sure the current mode is in 2D so that it properly and reliably changes to 3d
            this.$store.commit("Maps/setMode", "2D");
            Radio.trigger("Map", "mapChangeTo3d");
            console.log("toggle 2");
            // console.log("cesiumScene enabled3d", params, this.cesiumScene);
        },

        /**
         * Disables the 3d mode
         * @returns {void}
         */
        async disable3D () {
            // makes sure the current mode is in 3D so that it properly and reliably changes to 2d
            await this.$store.commit("Maps/setMode", "3D");
            await Radio.trigger("Map", "mapChangeTo3d");
            console.log("toggle 2");
        }
    }
};
