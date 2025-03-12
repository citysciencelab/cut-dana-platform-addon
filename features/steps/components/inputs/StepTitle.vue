<template>
    <v-text-field
        id="step-title"
        v-model="title"
        class="vue-text-all-top"
        :label="t('additional:modules.dataNarrator.label.stepTitle')"
        hide-details="auto"
    />
</template>
<script setup>
import {useTranslation} from "i18next-vue";
import {useStepForm} from "../../hooks/useStepForm";

const {t} = useTranslation();
const { title } = useStepForm();
</script>
