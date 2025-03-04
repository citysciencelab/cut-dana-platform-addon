<script setup lang="ts">

/**
 *
 */
function toggleSharedSettings () {
    console.log("toggleSharedSettings");
}
</script>

<template>
    <v-tooltip top>
        <template #activator="{ on }">
            <v-icon
                id="share-button"
                color="green"
                v-on="on"
                @click="toggleSharedSettings"
            >
                {{ mdiEyeSettings }}
            </v-icon>
        </template>
        <span>
            {{ $t("additional:modules.dataNarrator.button.shareSettings") }}
        </span>
    </v-tooltip>
</template>

