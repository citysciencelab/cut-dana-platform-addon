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
        rounded
        :color="active ? 'info' : ''"
        @click="$emit('refreshStoryList', mode)"
    >
        {{ $t(`additional:modules.dataNarrator.storyList.${mode}`) }}
    </v-btn>
</template>
