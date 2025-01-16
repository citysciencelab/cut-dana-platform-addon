<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersDataNarrator";
import mutations from "../store/mutationsDataNarrator";
import DataNarratorWindowMixins from "../mixins/DataNarratorWindowMixins";
import Toolwindow from "./ToolWindow/Toolwindow.vue";
import TestingLogin from "./Login/TestingLogin.vue";

export default {
    name: "DataNarratorDashboard",
    mixins: [DataNarratorWindowMixins],
    components: {TestingLogin, Toolwindow},
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters))
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations))
    },

};
</script>

<template>
    <Toolwindow>
        <div>dashboard</div>
    </Toolwindow>
</template>

<style scoped lang="scss">

</style>
