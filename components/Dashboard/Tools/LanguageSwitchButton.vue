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
            i18next.changeLanguage(this.nextLanguage());
            this.currentLanguage = i18next.language;
        },
        nextLanguage () {
            const currentIndex = this.languages.indexOf(i18next.language),
                nextIndex = currentIndex === this.languages.length - 1 ? 0 : currentIndex + 1;

            return this.languages[nextIndex] || i18next.language;
        }
        // },
        // currentLanguage () {
        //     return i18next.language;
        // }
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


<style>
/* Your component's styles go here */
</style>
