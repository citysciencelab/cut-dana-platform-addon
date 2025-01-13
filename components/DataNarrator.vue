<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersDataNarrator";
import mutations from "../store/mutationsDataNarrator";
import DataNarratorWindowMixins from "../mixins/DataNarratorWindowMixins";
import Toolwindow from "./Toolwindow.vue";
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
    },
    data() {
        return {
            // mode: null
        }
    }
};
</script>

<template lang="html">
    <div>
        test
        <Teleport to="#datanarrator-root">
            <TestingLogin v-if="mode === constants.dataNarratorModes.LOGIN_TEST"/>
            <DataNarratorDashboard v-if="mode === constants.dataNarratorModes.DASHBOARD"/>
        </Teleport>
    </div>

</template>

<style lang="scss">
#datanarrator-root {
    pointer-events: none;
    position: absolute;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    top: 0;

    display: grid;
    grid-template-columns: 100px auto 100px;
    gap: 10px;
}

</style>
