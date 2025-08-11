<script setup>
import {useTranslation} from "i18next-vue";
import {computed} from "vue";

const props = defineProps({
   value: String,
});

const emit = defineEmits(['update:value']);
const inputValue = computed({
    get() { return props.value },
    set(v) { emit('update:value', v) }
});

const {t} = useTranslation();
</script>

<template>
    <v-text-field
        variant="outlined"
        density="comfortable"
        :label="t('additional:modules.dataNarrator.label.stepTitle')"
        v-model="inputValue"
        hide-details
    />
</template>
