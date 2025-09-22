<script setup>
import {computed} from "vue";

import {useBaseLayer} from "../../../hooks/useBaseLayer";

const {items} = useBaseLayer();

const props = defineProps({
    modelValue: String
});
const emit = defineEmits(['update:modelValue']);

const inputValue = computed({
    get: () => props.modelValue,
    set: v => emit('update:modelValue', v)
});
</script>

<template>
    <v-select
        :items="items"
        density="comfortable"
        label="Hintergrundkarte"
        variant="outlined"
        hide-details
        v-model="inputValue"
    />
</template>
