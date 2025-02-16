<script>
import axios from "axios";
import {mapGetters} from "vuex";
import {mdiCancel, mdiCheck} from "@mdi/js";

import ShareSettings from "./ShareSettings.vue";

export default {
    name: "ShareSettingsForm",
    components: {
        ShareSettings
    },
    props: {
        story: {
            type: Object,
            default: null
        }
    },
    data () {
        return {
            icons: {
                mdiCheck,
                mdiCancel
            },
            storySettings: {
                private: this.story.private,
                sharedWith: this.story.sharedWith
            }
        };
    },
    computed: {
        ...mapGetters("Modules/DataNarrator", ["backendConfig"])
    },
    methods: {
        saveStorySettings () {
            const url = this.backendConfig.url + "/stories/" + this.story._id + "/privacy",
                data = {
                    private: this.storySettings.private,
                    sharedWith: this.storySettings.sharedWith
                };

            axios.patch(url, data).then(() => {
                this.$root.snackB.show({
                    message: this.$t("common:general.success")
                });
                this.$emit("refreshStoryList");
            }).catch(() => {
                this.$root.snackB.show({
                    message: this.$t("common:general.error"), color: "red"
                });
            });
        }
    }
};
</script>

<template>
    <v-card-text>
        <ShareSettings
            :private-story="storySettings.private"
            :shared-with="storySettings.sharedWith"
            @update:private-story="newValue => storySettings.private = newValue"
            @update:shared-with="newValue => storySettings.sharedWith = newValue"
        />

        <div class="form-group">
            <v-tooltip top>
                <template #activator="{ on }">
                    <span
                        id="reset-button"
                        class="mr-1"
                        v-on="on"
                    >
                        <v-btn
                            class=""
                            icon
                            @click="$emit('close:shared-settings')"
                        >
                            <v-icon size="24px">{{ icons.mdiCancel }}</v-icon>
                        </v-btn>
                    </span>
                </template>
                <span>
                    {{
                        $t("common:button.cancel")
                    }}
                </span>
            </v-tooltip>


            <v-tooltip top>
                <template #activator="{ on }">
                    <span
                        id="save-button"
                        class="mr-1"
                        v-on="on"
                    >
                        <v-btn
                            class=""
                            icon
                            @click="saveStorySettings()"
                        >

                            <v-icon size="24px">{{ icons.mdiCheck }}</v-icon>
                        </v-btn>

                    </span>
                </template>
                <span>
                    {{
                        $t("common:button.save")
                    }}
                </span>
            </v-tooltip>
        </div>
    </v-card-text>
</template>
