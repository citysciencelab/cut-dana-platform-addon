<script>
import PlayButton from "./StoryActionButtons/PlayButton.vue";
import ShareButton from "./StoryActionButtons/ShareButton.vue";
import EditButton from "./StoryActionButtons/EditButton.vue";
import DeleteButton from "./StoryActionButtons/DeleteButton.vue";
import FeaturedButton from "./StoryActionButtons/FeaturedButton.vue";
import ShareSettingsButton from "./StoryActionButtons/ShareSettingsButton.vue";

import ShareSettingsForm from "./ShareSettingsForm.vue";

export default {
    name: "StoryCard",
    components: {
        PlayButton,
        ShareButton,
        EditButton,
        DeleteButton,
        FeaturedButton,
        ShareSettingsButton,
        ShareSettingsForm
    },
    props: {
        story: {
            type: Object,
            default: null
        },
        uid: {
            type: String,
            default: null
        },
        isAdmin: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            shareSettings: false
        };
    },
    methods: {
        editable () {
            return this.isAdmin || this.story.owner === this.uid;
        }
    }
};
</script>

<template>
    <v-col class="grid-item col-xs-12 col-sm-6 col-md-4 col-lg-3">
        <v-card
            elevation="2"
        >
            <div class="d-flex flex-no-wrap justify-space-between overflow-hidden">
                <div>
                    <v-card-title>
                        <FeaturedButton
                            :story-id="story._id"
                            :is-featured="story.featured"
                            :is-admin="isAdmin"
                        />
                        <span class="text-h6 font-weight-light">{{ story.title }}</span>
                    </v-card-title>
                    <v-card-subtitle>
                        {{
                            $t("additional:modules.tools.dataNarrator.label.author")
                        }}: &nbsp; {{ story.author }}
                    </v-card-subtitle>
                </div>
                <v-avatar
                    v-if="story.titleImage"
                    class="ma-3"
                    size="125"
                    rounded="3"
                >
                    <v-img
                        :src="story.titleImage"
                        :alt="story.title"
                    />
                </v-avatar>
            </div>

            <v-card-text>
                {{ story.description }}
            </v-card-text>


            <v-card-actions>
                <PlayButton :story-id="story._id" />
                <ShareButton
                    :story-id="story._id"
                    v-on="$listeners"
                />

                <v-spacer />

                <ShareSettingsButton
                    v-if="editable()"
                    :story="story"
                    @toggle:shared-settings="shareSettings = !shareSettings"
                />
                <EditButton
                    v-if="editable()"
                    :story-id="story._id"
                />
                <DeleteButton
                    v-if="editable()"
                    :story-id="story._id"
                    v-on="$listeners"
                />
            </v-card-actions>

            <ShareSettingsForm
                v-if="shareSettings"
                :story="story"
                @close:shared-settings="shareSettings = false"
                v-on="$listeners"
            />
        </v-card>
    </v-col>
</template>

<style lang="scss" scoped>
    .v-card {
        margin-left: 5px;
        margin-right: 5px;
        margin-bottom: 10px;
        width: auto;
    }
    // .grid-item {
    //     margin-bottom: 20px;
    // }
</style>
