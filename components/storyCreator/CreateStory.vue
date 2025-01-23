<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import DataNarratorWindowMixins from "../../mixins/DataNarratorWindowMixins";
import Toolwindow from "../ToolWindow/Toolwindow.vue";
import CreateStoryHeader from "./CreateStoryHeader.vue";

export default {
    name: "CreateStory",
    mixins: [DataNarratorWindowMixins],
    components: {CreateStoryHeader, Toolwindow},
    computed: {
        ...mapGetters("Modules/DataNarrator", Object.keys(getters))
    },
    methods: {
        ...mapMutations("Modules/DataNarrator", Object.keys(mutations))
    },
};
</script>

<template>
    <Toolwindow>
        <template v-slot:header>
            <CreateStoryHeader />
        </template>
        <template v-slot:default>
            Create story page
        </template>
    </Toolwindow>
</template>

<style scoped lang="scss">

</style>
