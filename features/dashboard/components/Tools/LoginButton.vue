<script setup>

import {useLogin} from "../../hooks/useLogin";
import {mdiLogin, mdiLogout} from "@mdi/js";
import {useTranslation} from "i18next-vue";

const {loggedIn, openLoginWindow, checkLoggedIn, logout} = useLogin();
const {t} = useTranslation();

checkLoggedIn();

const loginLogoutAction = () => {
    console.log("logging in or out", loggedIn.value);
    if (loggedIn.value) {
        logout();
        return;
    }

    openLoginWindow();
}
</script>

<template>
    <v-btn
        rounded
        small
        @click="loginLogoutAction()"
    >
        <v-icon small>
            {{ loggedIn ? mdiLogout : mdiLogin }}
        </v-icon>
        {{
            loggedIn ?
                t("common:modules.login.logout") :
                t("common:modules.login.login")
        }}
    </v-btn>
</template>

