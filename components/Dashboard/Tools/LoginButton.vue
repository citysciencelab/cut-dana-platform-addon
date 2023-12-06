<script>
import {mapGetters} from "vuex";

import {
    mdiLogout,
    mdiLogin
} from "@mdi/js";

export default {
    name: "LoginButton",
    data () {
        return {
            icons: {
                mdiLogout,
                mdiLogin
            }
        };
    },
    computed: {
        ...mapGetters("Tools/Login", ["loggedIn"])
    },
    methods: {
        openLoginWindow () {
            if (!this.loggedIn) {
                this.$store.commit("Tools/Login/setActive", true);
            }
            else {
                this.$store.dispatch("Tools/Login/logout");
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

<template>
    <v-btn
        text
        rounded
        small
        @click="openLoginWindow()"
    >
        <v-icon small>
            {{ loggedIn ? icons.mdiLogout : icons.mdiLogin }}
        </v-icon>
        {{
            loggedIn ?
                $t("common:modules.login.logout") :
                $t("common:modules.login.login")
        }}
    </v-btn>
</template>
