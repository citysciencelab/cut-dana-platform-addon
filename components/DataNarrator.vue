<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersDataNarrator";
import mutations from "../store/mutationsDataNarrator";
import DataNarratorWindowMixins from "../mixins/DataNarratorWindowMixins";
import Toolwindow from "./ToolWindow/Toolwindow.vue";
import TestingLogin from "./Login/TestingLogin.vue";
import * as constants from "../store/contantsDataNarrator";
import DataNarratorDashboard from "./Dashboard.vue";

export default {
    name: "DataNarrator",
    mixins: [DataNarratorWindowMixins],
    components: {DataNarratorDashboard, TestingLogin, Toolwindow},
    computed: {
        ...mapGetters("Modules/DataNarrator", Object.keys(getters)),
        ...mapGetters("Modules/Login", ["accessToken"]),
        constants() {
            return constants;
        }
    },
    watch: {
      "mode": {
          handler() {
          }
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
    data() {
        return {
            // mode: null
        }
    }
};
</script>

<template lang="html">
    <Teleport to="#datanarrator-root" >
        <div id="datanarrator-container" :class="{mobile: isMobile}">
            <TestingLogin v-if="mode === constants.dataNarratorModes.LOGIN_TEST"/>
            <DataNarratorDashboard v-if="mode === constants.dataNarratorModes.DASHBOARD"/>
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
        gap: 10px;

        &.mobile {
            grid-template-columns: 0 auto 0 !important;
        }
    }


}



</style>
