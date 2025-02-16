<script>
import {mdiEyeSettings} from "@mdi/js";

export default {
    name: "ShareSettingsButton",
    props: {
        story: {
            type: Object,
            default: null
        }
    },
    data () {
        return {
            icons: {
                mdiEyeSettings
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
                :color="story.private ? 'red' : 'green'"
                v-on="on"
                @click="$emit('toggle:shared-settings')"
            >
                {{ icons.mdiEyeSettings }}
            </v-icon>
        </template>
        <span>
            {{ $t("additional:modules.dataNarrator.button.shareSettings") }}
        </span>
    </v-tooltip>
</template>
