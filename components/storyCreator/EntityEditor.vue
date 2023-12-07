<script>
import {mapActions, mapGetters, mapMutations} from "vuex";


import actions from "../../store/actionsDataNarrator";
import * as constants from "../../store/constantsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";


export default {
    name: "EntityEditor",

    components: {

    },

    props: {
        // The initial values for a step to edit
        editedStep: {
            type: Object,
            default: () => ({})
        }
    },
    data () {
        return {
            constants,
            // items: this.editedStep?.threeDLayers || {},

            step: this.editedStep || {},
            threeDFiles: this.editedStep.threeDFiles || []
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),
        ...mapGetters(["namedProjections"]),
        ...mapGetters("Maps", ["altitude", "longitude", "latitude", "clickCoordinate", "mouseCoordinate"])


    },
    watch: {


    },
    mounted () {
        // set map to 3d
        console.log(this.step);

        // console.log("mounted");
    },
    beforeDestroy () {
        // console.log("beforeDestroy");
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),
        ...mapMutations("Tools/Gfi", {setGfiActive: "setActive"})


    }
};
</script>

<template lang="html">
    <div
        id="tool-dataNarrator-creator-entityEditor"
        class="mb-8"
    >
        HELLO
    </div>
</template>

<style lang="scss" scoped>

#tool-dataNarrator-creator-entityEditor {
    max-width: 460px;
    position: relatieve;

}
</style>
