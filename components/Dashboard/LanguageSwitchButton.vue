<script>


export default {
    name: "LanguageSwitchButton",
    data () {
        return {
            languages: Object.keys(Config.portalLanguage?.languages)
        };
    },
    methods: {
        changeToNextLanguage () {
            i18next.changeLanguage(this.nextLanguage());
        },
        nextLanguage () {
            const currentIndex = this.languages.indexOf(i18next.language),
                nextIndex = currentIndex === this.languages.length - 1 ? 0 : currentIndex + 1;

            return this.languages[nextIndex] || i18next.language;
        },
        currentLanguage () {
            return i18next.language;
        }
    }
};
</script>

<template>
    <v-tooltip left>
        <template #activator="{ on }">
            <span
                id="language-button"
                class="mr-1 text-uppercase"
                tabindex="0"
                role="button"
                @click="changeToNextLanguage()"
                @keypress="changeToNextLanguage()"
                v-on="on"
            >
                {{ currentLanguage() }}
            </span>
        </template>
        <span>
            {{
                $t("additional:modules.tools.dataNarrator.label.clickToSwitch") + nextLanguage().toUpperCase()
            }}
        </span>
    </v-tooltip>
</template>


<style>
/* Your component's styles go here */
</style>
