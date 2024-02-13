import Radio from "backbone.radio/build/backbone.radio";

export default {

    computed: {
        // Computed property to get the value from Vuex store
        is3D () {
            return Radio.request("Map", "isMap3d");
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
         * @returns {void}
         */
        async enable3D () {

            // Ensure the current mode is set to 2D before switching to 3D.
            this.$store.commit("Maps/setMode", "2D");
            Radio.trigger("Map", "mapChangeTo3d");

            /**
             * Get the 3d map
             * It avoids direct reassignment of map3D in a way that could cause race conditions.
             * @returns {Object} the 3dmap object
             */
            function getMap3D () {
                return Radio.request("Map", "getMap3d");
            }



            return new Promise((resolve) => {
                let counter = 0;
                const intervalId = setInterval(() => {
                    const map3D = getMap3D();

                    if (map3D) {
                        clearInterval(intervalId);
                        resolve(map3D);
                    }
                    counter = counter + 1;
                }, 100); // Check every  100ms, adjust as needed
            });
        },

        /**
         * Disables the 3d mode
         * @returns {void}
         */
        async disable3D () {
            // makes sure the current mode is in 3D so that it properly and reliably changes to 2d
            await this.$store.commit("Maps/setMode", "3D");
            await Radio.trigger("Map", "mapChangeTo3d");
        }
    }
};
