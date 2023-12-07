<script>
import {
    mdiAccountArrowDown,
    mdiSortClockAscendingOutline,
    mdiPlaylistStar,
    mdiSortDescending
} from "@mdi/js";

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
    },
    data () {
        return {
            icons: {
                mdiAccountArrowDown,
                mdiSortClockAscendingOutline,
                mdiPlaylistStar,
                mdiSortDescending
            }
        };
    },
    methods: {
        icon () {
            if (this.mode === "my") {
                return this.icons.mdiAccountArrowDown;
            }
            else if (this.mode === "featured") {
                return this.icons.mdiPlaylistStar;
            }
            else if (this.mode === "popular") {
                return this.icons.mdiSortDescending;
            }
            return this.icons.mdiSortClockAscendingOutline;
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
