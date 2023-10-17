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
        currentMode: {
            type: String,
            default: null
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
    <v-tooltip left>
        <template #activator="{ on }">
            <v-icon
                size="24px"
                :color="currentMode === mode ? 'info' : ''"
                @click="$emit('refreshStoryList', mode)"
                v-on="on"
            >
                {{ icon() }}
            </v-icon>
        </template>
        <span>
            {{
                $t(`additional:modules.tools.dataNarrator.storyList.${mode}`)
            }}
        </span>
    </v-tooltip>
</template>
