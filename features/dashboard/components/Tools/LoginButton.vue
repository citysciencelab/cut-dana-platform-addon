<script setup>

import {useLogin} from "../../hooks/useLogin";
import {mdiLogin, mdiLogout} from "@mdi/js";
import {useTranslation} from "i18next-vue";

const {loggedIn, openLoginWindow} = useLogin();
const {t} = useTranslation();
</script>

<template>
    <v-btn
        rounded
        small
        @click="openLoginWindow()"
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

