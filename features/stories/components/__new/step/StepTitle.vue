<script setup>
import {useTranslation} from "i18next-vue";

const {t} = useTranslation();
</script>

<template>
    <v-text-field
        variant="outlined"
        density="comfortable"
        :label="t('additional:modules.dataNarrator.label.stepTitle')"
        hide-details
    />
</template>
