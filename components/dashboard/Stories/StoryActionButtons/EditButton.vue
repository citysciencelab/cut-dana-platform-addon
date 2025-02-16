<script>
import {mapActions, mapMutations} from "vuex";
import {mdiPencil} from "@mdi/js";

import * as constants from "../../../../store/contantsDataNarrator";
import mutations from "../../../../store/mutationsDataNarrator";
import actions from "../../../../store/actionsDataNarrator";

export default {
    name: "EditButton",
    props: {
        storyId: {
            type: String,
            default: null
        }
    },
    data () {
        return {
            icons: {
                mdiPencil
            }
        };
    },
    methods: {
        ...mapMutations("Modules/DataNarrator", Object.keys(mutations)),
        ...mapActions("Modules/DataNarrator", Object.keys(actions)),
        /**
         * Edit the story that is selected and fetches the corresponding Story json from the API
         * @returns {void}
         */
        edit () {
            this.setCurrentStoryId(this.storyId);
            this.loadCurrentStory({mode: constants.storyTellingModes.CREATE});
        }
    }
};
</script>

<template>
    <v-tooltip top>
        <template #activator="{ on }">
            <v-icon
                id="edit-button"
                v-on="on"
                @click="edit()"
            >
                {{ icons.mdiPencil }}
            </v-icon>
        </template>
        <span>
            {{
                $t("additional:modules.tools.dataNarrator.creator.edit")
            }}
        </span>
    </v-tooltip>
</template>
