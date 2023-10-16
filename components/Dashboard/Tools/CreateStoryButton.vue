<script>
import {mapActions, mapMutations} from "vuex";

import * as constants from "../../../store/constantsDataNarrator";
import mutations from "../../../store/mutationsDataNarrator";
import actions from "../../../store/actionsDataNarrator";

export default {
    name: "CreateStoryButton",
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),
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
    <v-tooltip left>
        <template #activator="{ on }">
            <v-icon
                id="create-button"
                class="mr-1"
                @click="createStory()"
                v-on="on"
            >
                add_circle_outline
            </v-icon>
        </template>
        <span>
            {{
                $t("additional:modules.tools.dataNarrator.create")
            }}
        </span>
    </v-tooltip>
</template>
