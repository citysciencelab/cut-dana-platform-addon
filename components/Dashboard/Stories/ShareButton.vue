<script>
import {mdiShareAll} from "@mdi/js";

export default {
    name: "ShareButton",
    props: {
        storyId: {
            type: String,
            default: null
        }
    },
    data () {
        return {
            icons: {
                mdiShareAll
            }
        };
    },
    methods: {
        /**
         * Share the story that is selected
         * @returns {void}
         */
        share () {
            this.$emit("share-story", this.storyId, 0);
        }
    }

};
</script>

<template>
    <v-tooltip top>
        <template #activator="{ on }">
            <v-icon
                id="share-button"
                class="ml-1 mr-1"
                v-on="on"
                @click="share()"
            >
                {{ icons.mdiShareAll }}
            </v-icon>
        </template>
        <span>
            {{
                $t("additional:modules.tools.dataNarrator.button.share")
            }}
        </span>
    </v-tooltip>
</template>
