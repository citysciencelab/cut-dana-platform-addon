<script>

export default {
    name: "ListButton",
    props: {
        mode: {
            type: String,
            default: null
        },
        active: {
            type: Boolean,
            default: false
        }
    }
};
</script>

<template>
    <v-btn
        text
        rounded
        x-small
        :color="active ? 'info' : ''"
        @click="$emit('refreshStoryList', mode)"
    >
        {{ $t(`additional:modules.tools.dataNarrator.storyList.${mode}`) }}
    </v-btn>
</template>
