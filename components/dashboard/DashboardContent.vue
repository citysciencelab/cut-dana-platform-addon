<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import DataNarratorWindowMixins from "../../mixins/DataNarratorWindowMixins";
import Toolwindow from "../ToolWindow/Toolwindow.vue";
import DashboardHeader from "../dashboard/DashboardHeader.vue";
import NavigationMixins from "../../mixins/NavigationMixins";
import {dataNarratorModes} from "../../store/contantsDataNarrator";

export default {
    name: "DashboardContent",
    mixins: [DataNarratorWindowMixins, NavigationMixins],
    components: {DashboardHeader, Toolwindow},
    computed: {
        ...mapGetters("Modules/DataNarrator", Object.keys(getters)),
        dataNarratorModes() {
            return dataNarratorModes
        }
    },
    methods: {
        ...mapMutations("Modules/DataNarrator", Object.keys(mutations))
    },
};
</script>

<template>
    <button @click="() => gotoPage(dataNarratorModes.CREATE_STORY)">Create story</button>
</template>

<style scoped lang="scss">

</style>
