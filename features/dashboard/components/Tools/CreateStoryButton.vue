<template>
    <v-btn
        v-if="loggedIn"
        outlined
        rounded
        small
        @click="() => gotoPage(dataNarratorModes.CREATE_STORY)"
    >
        <v-icon small>
            {{ mdiPlus }}
        </v-icon>
        {{
            t("additional:modules.dataNarrator.create")
        }}
    </v-btn>
</template>
<script setup>

import {mdiPlus} from "@mdi/js";
import {useTranslation} from "i18next-vue";
import {useLogin} from "../../hooks/useLogin";
import {useDashboard} from "../../hooks/useDashboard";

const {t} = useTranslation();
const {loggedIn} = useLogin();
const {gotoPage, dataNarratorModes} = useDashboard();


</script>
