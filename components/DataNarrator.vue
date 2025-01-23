<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersDataNarrator";
import mutations from "../store/mutationsDataNarrator";
import DataNarratorWindowMixins from "../mixins/DataNarratorWindowMixins";
import Toolwindow from "./ToolWindow/Toolwindow.vue";
import * as constants from "../store/contantsDataNarrator";
import DataNarratorDashboard from "./dashboard/Dashboard.vue";
import LoginMixin from "../mixins/LoginMixin";
import CreateStory from "./storyCreator/CreateStory.vue";

export default {
    name: "DataNarrator",
    mixins: [DataNarratorWindowMixins, LoginMixin],
    components: {CreateStory, DataNarratorDashboard, Toolwindow},
    computed: {
        ...mapGetters("Modules/DataNarrator", ["mode", "toolwindowMode"]),
        ...mapGetters("Modules/Login", ["accessToken"]),
        constants() {
            return constants;
        }
    },

    methods: {
        ...mapMutations("Modules/DataNarrator", Object.keys(mutations))
    },

    mounted() {
        this.disableMainMenu();
        this.disableSecondaryMenu();
        this.disableFooter();
    },
};
</script>

<template lang="html">
    <Teleport to="#datanarrator-root" >
        <div id="datanarrator-container" :class="[toolwindowMode]">
            <DataNarratorDashboard v-if="mode === constants.dataNarratorModes.DASHBOARD"/>
            <CreateStory v-if="mode === constants.dataNarratorModes.CREATE_STORY"/>
        </div>
    </Teleport>
</template>

<style lang="scss">
#datanarrator-root {
    pointer-events: none;
    position: absolute;
    top: 0;

    #datanarrator-container {
        width: 100vw;
        height: 100vh;
        overflow: hidden;

        display: grid;
        grid-template-columns: 12rem auto 12rem;

        position: relative;

        &.mobile {
            grid-template-columns: 0 auto 0 !important;
        }

        &.dashboard {
            grid-template-columns: 12rem auto 12rem !important;
        }

        &.desktop {
            grid-template-columns: 30rem auto 0 !important;
            padding-left: 1rem !important;
        }
    }


}



</style>
