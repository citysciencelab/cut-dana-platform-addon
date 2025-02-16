<script>
import {mapGetters} from "vuex";

import {
    mdiLogout,
    mdiLogin
} from "@mdi/js";
import LoginMixin from "../../../mixins/LoginMixin";

export default {
    name: "LoginButton",
    mixins: [LoginMixin],
    data () {
        return {
            icons: {
                mdiLogout,
                mdiLogin
            }
        };
    },
    computed: {
        ...mapGetters("Modules/Login", ["loggedIn"])
    }
};
</script>

<template>
    <v-btn
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
