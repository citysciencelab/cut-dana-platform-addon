<script>
import {mapActions, mapMutations} from "vuex";
import {mdiPlus} from "@mdi/js";

import * as constants from "../../../store/constantsDataNarrator";
import mutations from "../../../store/mutationsDataNarrator";
import actions from "../../../store/actionsDataNarrator";

export default {
    name: "CreateStoryButton",
    data () {
        return {
            icons: {
                mdiPlus
            }
        };
    },
    methods: {
        ...mapMutations("Modules/DataNarrator", Object.keys(mutations)),
        ...mapActions("Modules/DataNarrator", Object.keys(actions)),
        /**
         * Creates a new story, switch mode
         * @returns {void}
         */
        createStory () {
            this.setCurrentStory({
                ...constants.emptyStory,
                author: this.$store.state.Tools.Login.screenName || "anonymous"
            });
            this.setCurrentStoryId(null);
            this.setMode(constants.storyTellingModes.CREATE);
        }
    }
};
</script>

<template>
    <v-btn
        outlined
        rounded
        small
        @click="createStory()"
    >
        <v-icon small>
            {{ icons.mdiPlus }}
        </v-icon>
        {{
            $t("additional:modules.tools.dataNarrator.create")
        }}
    </v-btn>
</template>
