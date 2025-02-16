<script>
import {mdiLink} from "@mdi/js";

export default {
    name: "ShareButton",
    props: {
        storyId: {
            type: String,
            default: null
        },
        stepIndex: {
            type: String,
            default: "s"
        }
    },
    data () {
        return {
            icons: {
                mdiLink
            }
        };
    }

};
</script>

<template>
    <v-tooltip top>
        <template #activator="{ on }">
            <v-icon
                id="share-button"
                v-on="on"
                @click="$emit('share-story', storyId, stepIndex)"
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
