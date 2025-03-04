<script setup lang="ts">

const {storyId} = defineProps({
    storyId: {
        type: String,
        default: "share-story"
    }
});

function shareStory () {
    console.log("shareStory", storyId);
}
</script>

<template>
    <v-tooltip top>
        <template #activator="{ on }">
            <v-icon
                id="share-button"
                v-on="on"
                @click="shareStory"
            >
                {{ icons.mdiLink }}
            </v-icon>
        </template>
        <span>
            {{
                $t("additional:modules.dataNarrator.button.share")
            }}
        </span>
    </v-tooltip>
</template>

