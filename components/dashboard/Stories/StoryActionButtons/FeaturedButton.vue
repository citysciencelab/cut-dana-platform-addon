<script>
import axios from "axios";
import {mapGetters} from "vuex";
import {mdiStar} from "@mdi/js";

export default {
    name: "FeaturedButton",
    props: {
        storyId: {
            type: String,
            default: null
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        isFeatured: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            icons: {
                mdiStar
            },
            featured: this.isFeatured
        };
    },
    computed: {
        ...mapGetters("Modules/DataNarrator", ["backendConfig"])
    },
    methods: {
        makeItFeatured () {
            if (!this.isAdmin) {
                return; // do nothing
            }

            this.storyConfURL = this.backendConfig.url + "/stories/" + this.storyId + "/featured";

            axios
                .patch(this.storyConfURL)
                .then(() => {
                    this.featured = !this.featured;
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
    <v-tooltip top>
        <template #activator="{ on }">
            <v-icon
                id="featured-button"
                :color="featured ? 'warning' : ''"
                v-on="on"
                @click="makeItFeatured()"
            >
                {{ icons.mdiStar }}
            </v-icon>
        </template>
        <span>
            {{
                $t("additional:modules.tools.dataNarrator.button.featured")
            }}
        </span>
    </v-tooltip>
</template>
