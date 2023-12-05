<script>
import {mapActions, mapMutations} from "vuex";
import {mdiPlayOutline} from "@mdi/js";

import * as constants from "../../../../store/constantsDataNarrator";
import mutations from "../../../../store/mutationsDataNarrator";
import actions from "../../../../store/actionsDataNarrator";

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
                mdiPlayOutline
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
            <v-btn
                dark
                rounded
                x-small
                @click="playStory()"
            >
                <v-icon
                    id="play-button"
                    color="white"
                    small
                    v-on="on"
                >
                    {{ icons.mdiPlayOutline }}
                </v-icon>
            </v-btn>
        </template>
        <span>
            {{
                $t("additional:modules.tools.dataNarrator.play")
            }}
        </span>
    </v-tooltip>
</template>


<style lang="scss" scoped>
#play-button {
    float:right;
    color: #413FAB;
}
</style>
