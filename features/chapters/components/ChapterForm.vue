<script setup>
import {useTranslation} from "i18next-vue";
import {useChapterForm} from "../hooks/useChapterForm";

const {t} = useTranslation();
const {name} = useChapterForm();
const saveChapter = async () => {
    console.log(name);
}

</script>

<template>
    <div id="tool-dataNarrator-creator-chapterForm">
        <form
            id="chapter-form"
            @submit.prevent="saveChapter"
        >
            <v-text-field
                id="name"
                v-model="name"
                class="vue-text-all-top"
                :label="t(
                            'additional:modules.dataNarrator.label.chapterName'
                        )"
                :rules="''"
                hide-details="auto"
            />
        </form>
    </div>
</template>

<style scoped lang="scss">

</style>
