<script>
import {mapActions, mapMutations} from "vuex";
import {mdiPencil} from "@mdi/js";

import {mutations} from "../../../../features/stories/store/EditStoryForm";
import {dataNarratorModes} from "../../../../store/contantsDataNarrator";
import NavigationMixins from "../../../../mixins/NavigationMixins";

export default {
    name: "EditButton",
    props: {
        storyId: {
            type: String,
            default: null
        }
    },
    mixins: [NavigationMixins],
    data () {
        return {
            icons: {
                mdiPencil
            }
        };
    },
    methods: {
        ...mapMutations("Modules/DataNarrator/EditStoryForm", Object.keys(mutations)),
        /**
         * Edit the story that is selected and fetches the corresponding Story json from the API
         * @returns {void}
         */
        gotoSelectedStory() {
            this.setSelectedStoryId(this.storyId);
            this.gotoPage(dataNarratorModes.CREATE_STORY);
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
                @click="gotoSelectedStory()"
            >
                {{ icons.mdiPencil }}
            </v-icon>
        </template>
        <span>
            {{
                $t("additional:modules.dataNarrator.creator.edit")
            }}
        </span>
    </v-tooltip>
</template>
