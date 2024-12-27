<script>


import {mapGetters, mapMutations} from "vuex";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import LoginMixin from "../../mixins/LoginMixin";
import Toolwindow from "../Toolwindow.vue";

export default {
    name: "TestingLogin",
    mixins: [LoginMixin],
    components: {Toolwindow},
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters))
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations))
    }
};
</script>

<template lang="html">
    <Toolwindow>
        <div>login</div>
    </Toolwindow>
</template>
