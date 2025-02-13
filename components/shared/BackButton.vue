<script>

import {mapGetters} from "vuex";
import getters from "../../store/gettersDataNarrator";
import {mdiArrowLeft} from "@mdi/js";

export default {
    name: "BackButton",
    props: {
        tooltip: {
            type: String,
            default: "additional:modules.tools.dataNarrator.button.backToStory"
        },
        text: {
            type: String,
            default: "additional:modules.tools.dataNarrator.button.backToStep"
        },
        showStoryTitle: {
            type: Boolean,
            default: true
        }
    },
    data () {
        return {
            icons: {
                mdiArrowLeft
            }
        };
    },
    computed: {
        ...mapGetters("Modules/DataNarrator", Object.keys(getters))
    },
    mounted() {
        console.log("BackButton mounted");
        console.log(this.icons.mdiArrowLeft)
    }
};
</script>

<template>
    <span>
        <span
            role="button"
            tabindex="0"
        >
            <v-tooltip left>
                <template #activator="{ on, attrs }">
                    <v-icon
                        v-bind="attrs"
                        v-on="on"
                        @click="$emit('click')"
                        @keydown="$emit('click')"
                    >
                        {{ icons.mdiArrowLeft }}
                    ></v-icon>
                </template>
                <span>{{ $t(tooltip) }}</span>
            </v-tooltip>
        </span>
        <span
            v-if="showStoryTitle"
            class="story-title"
        >
            {{ $t(text) }}
        </span>
    </span>
</template>

<style lang="scss" scoped>
.v-icon {
    cursor: pointer;
}

.story-title {
    position: relative;
    top: 2px;
    font-weight: bold;
    font-size: 1.2em;
    margin-left: 10px;
}

.story-title, .chapter-title {
}
</style>
