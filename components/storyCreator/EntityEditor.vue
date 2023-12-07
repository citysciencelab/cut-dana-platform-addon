<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";


import actions from "../../store/actionsDataNarrator";
import * as constants from "../../store/constantsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import BackButton from "../shared/BackButton.vue";


export default {
    name: "EntityEditor",

    components: {
        BackButton
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

            step: this.editedStep,
            threeDFiles: this.editedStep.threeDFiles || [],

            position: null,
            orientation: null,
            scale: 1
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),
        ...mapGetters(["namedProjections"]),
        ...mapGetters("Maps", ["altitude", "longitude", "latitude", "clickCoordinate", "mouseCoordinate"]),
        selectedEntity () {
            return mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities.getById(this.selectedEntityId);
        }
    },
    watch: {

    },
    mounted () {
        // set map to 3d
        if (this.selectedEntity) {
            this.position = this.selectedEntity.position;
            this.orientation = this.selectedEntity.orientation;
            this.scale = parseFloat(this.selectedEntity.model.scale);
        }
        // console.log("mounted");
    },
    beforeDestroy () {
        // console.log("beforeDestroy");
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),
        ...mapMutations("Tools/Gfi", {setGfiActive: "setActive"}),

        updateScale () {
            this.scaleEntity({entityId: this.selectedEntityId, scale: this.scale});
        }
    }
};
</script>

<template lang="html">
    <div
        id="tool-dataNarrator-creator-entityEditor"
        class="mb-8"
    >
        <BackButton
            tooltip="additional:modules.tools.dataNarrator.button.backToStory"
            :text="step.title"
            @click="$emit('openView', constants.storyCreationViews.THREE_D)"
        />
        <div
            v-if="loading"
        >
            loading...
        </div>
        <div v-else>
            <div>
                <label for="scale-slider">Scale:</label>
                <input
                    id="scale-slider"
                    v-model="scale"
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    @input="updateScale"
                >
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>

#tool-dataNarrator-creator-entityEditor {
    max-width: 460px;
    position: relatieve;

}
</style>
