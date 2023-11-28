<script>
import {mdiLink} from "@mdi/js";

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
                @click="$emit('share-story', storyId, 's')"
            >
                {{ icons.mdiLink }}
            </v-icon>
        </template>
        <span>
            {{
                $t("additional:modules.tools.dataNarrator.button.share")
            }}
        </span>
    </v-tooltip>
</template>
