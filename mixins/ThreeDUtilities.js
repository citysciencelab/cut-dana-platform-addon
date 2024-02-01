
export default {

    computed: {
        // Computed property to get the value from Vuex store
        isMap3D () {
            return Radio.request("Map", "isMap3d");
        }
    },
    methods: {

        /**
         * Enables the 3d mode
         * @returns {void}
         */
        async enable3D () {
            // makes sure the current mode is in 2D so that it properly and reliably changes to 3d
            await this.$store.commit("Maps/setMode", "2D");
            Radio.trigger("Map", "mapChangeTo3d");
        },

        /**
         * Disables the 3d mode
         * @returns {void}
         */
        async disable3D () {
            // makes sure the current mode is in 3D so that it properly and reliably changes to 2d
            await this.$store.commit("Maps/setMode", "3D");
            Radio.trigger("Map", "mapChangeTo3d");
        },


        disableAllEntities () {
            console.log("disableAllEntites");
        }
    }
};
