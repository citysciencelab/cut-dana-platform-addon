
<script setup lang="ts">


import {mdiStar} from "@mdi/js";

/**
 *
 */
function makeItFeatured () {
    console.log("Featured Button");
}
</script>

<template>
    <v-tooltip top>
        <template #activator="{ on }">
            <v-icon
                id="featured-button"
                v-on="on"
                @click="makeItFeatured()"
            >
                {{ mdiStar }}
            </v-icon>
        </template>
        <span>
            {{
                $t("additional:modules.tools.dataNarrator.button.featured")
            }}
        </span>
    </v-tooltip>
</template>

