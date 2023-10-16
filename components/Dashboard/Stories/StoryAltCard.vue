<script>
import PlayButton from "./PlayButton.vue";
import ShareButton from "./ShareButton.vue";
import EditButton from "./EditButton.vue";
import DeleteButton from "./DeleteButton.vue";
import FeaturedButton from "./FeaturedButton.vue";

export default {
    name: "StoryAltCard",
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
            <v-spacer />
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
    </v-card>
</template>
