<script>


import {mapGetters, mapMutations} from "vuex";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import LoginMixin from "../../mixins/LoginMixin";
import Toolwindow from "../Toolwindow.vue";
import LoginButton from "./LoginButton.vue";

export default {
    name: "TestingLogin",
    mixins: [LoginMixin],
    components: {LoginButton, Toolwindow},
    computed: {
    },
    methods: {
    }
};
</script>

<template lang="html">
    <Toolwindow>
        <LoginButton />
    </Toolwindow>
</template>
