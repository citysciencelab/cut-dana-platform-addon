<script>
import axios from "axios";
import {mapGetters} from "vuex";
import {mdiTrashCanOutline} from "@mdi/js";

export default {
    name: "DeleteButton",
    props: {
        storyId: {
            type: String,
            default: null
        }
    },
    data () {
        return {
            icons: {
                mdiTrashCanOutline
            }
        };
    },
    computed: {
        ...mapGetters("Modules/DataNarrator", ["backendConfig"])
    },
    methods: {
        /**
         * Delete the story that is selected and reload list of stories

         * @returns {void}
         */
        deleteStoryWithConfirm () {

            /**
           * Constant that saves delete cofirm action
           * @returns {void}
           */
            const deleteStory = () => {
                this.storyConfURL = this.backendConfig.url + "/stories/" + this.storyId;

                axios
                    .delete(this.storyConfURL)
                    .then(() => {
                        this.$root.snackB.show({
                            message: this.$t(
                                "additional:modules.tools.dataNarrator.success.storyDeleted"
                            )
                        });
                        this.$emit("refreshStoryList");
                    }).catch(() => {
                        this.$root.snackB.show({
                            message: this.$t(
                                "additional:modules.tools.dataNarrator.error.storyDeleted"
                            ), color: "red"
                        });
                    });
            };

            this.$emit("confirm", "deleteStory", deleteStory);
        }
    }
};
</script>

<template>
    <v-tooltip top>
        <template #activator="{ on }">
            <v-icon
                id="delete-button"
                v-on="on"
                @click="deleteStoryWithConfirm()"
            >
                {{ icons.mdiTrashCanOutline }}
            </v-icon>
        </template>
        <span>
            {{
                $t("additional:modules.tools.dataNarrator.creator.delete")
            }}
        </span>
    </v-tooltip>
</template>
