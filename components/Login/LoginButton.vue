<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";

export default {
    name: "LoginButton",
    components: {},
    computed: {
        ...mapGetters("Modules/DataNarrator", Object.keys(getters)),
        ...mapGetters("Modules/Login", ["loggedIn"])
    },
    methods: {
        ...mapMutations("Modules/DataNarrator", Object.keys(mutations)),
        openLoginWindow () {
            console.log("openLoginWindow");
            if (!this.loggedIn) {
                this.$store.commit("Modules/Login/setActive", true);
            }
            else {
                this.$store.dispatch("Modules/Login/logout");
                // this.refreshStoryList("all");
                this.$root.snackB.show({
                    message: this.$t(
                        "additional:modules.tools.dataNarrator.success.loggedOut"
                    ), color: "green"
                });
            }
        }
    }
};
</script>

<template lang="html">
    <div>
        hi
        <button @click="openLoginWindow">Login</button>
    </div>
</template>
