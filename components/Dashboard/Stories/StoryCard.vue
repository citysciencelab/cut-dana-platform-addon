<script>
import PlayButton from "./PlayButton.vue";
import ShareButton from "./ShareButton.vue";
import EditButton from "./EditButton.vue";
import DeleteButton from "./DeleteButton.vue";
import FeaturedButton from "./FeaturedButton.vue";

export default {
    name: "StoryCard",
    components: {
        PlayButton,
        ShareButton,
        EditButton,
        DeleteButton,
        FeaturedButton
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
    methods: {
        editable () {
            return this.isAdmin || this.story.owner === this.uid;
        }
    }
};
</script>

<template>
    <v-card>
        <div class="d-flex flex-no-wrap justify-space-between overflow-hidden">
            <div>
                <div class="row">
                    <v-col
                        v-if="story.titleImage"
                        cols="6"
                    >
                        <v-img
                            :src="story.titleImage"
                            :alt="story.title"
                            max-width="200"
                            max-height="200"
                        />
                    </v-col>
                    <v-col :cols="story.titleImage ? 6 : 12">
                        <v-card-title
                            class="text-h5"
                        >
                            {{ story.title }}
                        </v-card-title>

                        <v-card-subtitle>
                            {{
                                $t("additional:modules.tools.dataNarrator.label.author")
                            }}: &nbsp; {{ story.author }}
                        </v-card-subtitle>
                    </v-col>

                    <div class="row">
                        <v-col
                            cols="12"
                        >
                            <v-card-text>
                                {{ story.description }}
                            </v-card-text>
                        </v-col>
                    </div>

                    <v-card-actions>
                        <PlayButton :story-id="story._id" />
                        <FeaturedButton
                            :story-id="story._id"
                            :is-featured="story.featured"
                            :is-admin="isAdmin"
                        />
                        <ShareButton
                            :story-id="story._id"
                            v-on="$listeners"
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
                </div>
            </div>
        </div>
    </v-card>
</template>
