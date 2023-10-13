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
    <v-tooltip left>
        <template #activator="{ on }">
            <v-icon
                id="login-button"
                class="mr-1"
                @click="openLoginWindow()"
                v-on="on"
            >
                {{ loggedIn ? icons.mdiLogout : icons.mdiLogin }}
            </v-icon>
        </template>
        <span>
            {{
                loggedIn ?
                    $t("common:modules.login.logout") :
                    $t("common:modules.login.login")
            }}
        </span>
    </v-tooltip>
</template>
