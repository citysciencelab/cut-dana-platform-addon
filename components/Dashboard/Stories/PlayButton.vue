<script>
import {mapActions, mapMutations} from "vuex";
import {mdiPresentationPlay} from "@mdi/js";

import * as constants from "../../../store/constantsDataNarrator";
import mutations from "../../../store/mutationsDataNarrator";
import actions from "../../../store/actionsDataNarrator";

export default {
    name: "PlayButton",
    props: {
        storyId: {
            type: String,
            default: null
        }
    },
    data () {
        return {
            icons: {
                mdiPresentationPlay
            }
        };
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),
        /**
         * Changes the story that is selected and fetches the corresponding Story json from the API
         * @returns {void}
         */
        playStory () {
            this.setCurrentStoryId(this.storyId);
            this.loadCurrentStory({mode: constants.storyTellingModes.PLAY});
        }
    }
};
</script>

<template>
    <v-tooltip top>
        <template #activator="{ on }">
            <v-icon
                id="play-button"
                class="ml-1 mr-1"
                color="info"
                v-on="on"
                @click="playStory()"
            >
                {{ icons.mdiPresentationPlay }}
            </v-icon>
        </template>
        <span>
            {{
                $t("additional:modules.tools.dataNarrator.play")
            }}
        </span>
    </v-tooltip>
</template>
