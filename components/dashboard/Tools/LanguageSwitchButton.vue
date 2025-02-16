<script>
import {mdiWeb} from "@mdi/js";
export default {
    name: "LanguageSwitchButton",
    data () {
        return {
            languages: Object.keys(Config.portalLanguage?.languages),
            currentLanguage: i18next.language,
            icons: {
                mdiWeb
            }
        };
    },
    methods: {
        changeToNextLanguage () {
            const nextLanguage = this.nextLanguage();

            this.currentLanguage = nextLanguage;
            i18next.changeLanguage(nextLanguage);
        },
        nextLanguage () {
            const currentIndex = this.languages.indexOf(i18next.language),
                nextIndex = currentIndex === this.languages.length - 1 ? 0 : currentIndex + 1;

            return this.languages[nextIndex] || i18next.language;
        }
    }
};
</script>

<template>
    <v-btn
        text
        rounded
        small
        @click="changeToNextLanguage()"
        @keypress="changeToNextLanguage()"
    >
        <v-icon small>
            {{ icons.mdiWeb }}
        </v-icon>
        {{ currentLanguage }}
    </v-btn>
</template>
