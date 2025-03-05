<template>
    <v-btn
        rounded
        small
        @click="changeToNextLanguage()"
        @keypress="changeToNextLanguage()"
    >
        <v-icon small>
            {{ mdiWeb }}
        </v-icon>
        {{ currentLanguage }}
    </v-btn>
</template>
<script setup>


import {useTranslation} from "i18next-vue";
import {mdiWeb} from "@mdi/js";

const {t, i18next} = useTranslation();

const currentLanguage = i18next.language;

function changeToNextLanguage () {
    const languages = ["en", "de"];
    const nextLanguage = languages[0];
    i18next.changeLanguage(nextLanguage);
}
</script>
