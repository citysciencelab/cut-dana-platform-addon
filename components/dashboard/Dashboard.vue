<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import DataNarratorWindowMixins from "../../mixins/DataNarratorWindowMixins";
import ToolWindow from "../../features/shared/Toolwindow/ToolWindow.vue";
import DashboardHeader from "./DashboardHeader.vue";
import DashboardContent from "./DashboardContent.vue";

export default {
    name: "DataNarratorDashboard",
    mixins: [DataNarratorWindowMixins],
    components: {DashboardHeader, Toolwindow: ToolWindow, DashboardContent},
    computed: {
        ...mapGetters("Modules/DataNarrator", Object.keys(getters))
    },
    methods: {
        ...mapMutations("Modules/DataNarrator", Object.keys(mutations))
    },
    watch: {
        "mode": function() {
        }
    }
};
</script>

<template>
    <Toolwindow>
        <template v-slot:header>
            <DashboardHeader />
        </template>
        <DashboardContent />
    </Toolwindow>
</template>

<style scoped lang="scss">

</style>
