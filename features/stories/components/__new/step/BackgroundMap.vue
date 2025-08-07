<script setup>
import {useBaseLayer} from "../../../hooks/useBaseLayer";

const {items} = useBaseLayer();
</script>

<template>
    <v-select
        :items="items"
        density="comfortable"
        label="Hintergrundkarte"
        variant="outlined"
        hide-details
    />
</template>
