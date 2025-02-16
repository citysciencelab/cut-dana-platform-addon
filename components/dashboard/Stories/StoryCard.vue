<script>
import PlayButton from "./StoryActionButtons/PlayButton.vue";
import ShareButton from "./StoryActionButtons/ShareButton.vue";
import EditButton from "./StoryActionButtons/EditButton.vue";
import DeleteButton from "./StoryActionButtons/DeleteButton.vue";
import FeaturedButton from "./StoryActionButtons/FeaturedButton.vue";
import ShareSettingsButton from "./StoryActionButtons/ShareSettingsButton.vue";
import ShareSettingsForm from "./ShareSettingsForm.vue";

import {mdiAccountOutline} from "@mdi/js";

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
        },
        grid: {
            type: Boolean,
            default: true
        }
    },
  mounted() {
  },
    data () {
        return {
            shareSettings: false,
            icons: {
                mdiAccountOutline
            }
        };
    },
    methods: {
        editable () {
            return this.isAdmin || this.story.owner === this.uid;
        },
        reloadMasonry () {
            this.$emit("imageLoaded");
        }
    }
};
</script>

<template>
    <v-card
        class="mb-5"
        flat
        :class="{'grid-item': grid, 'topper': shareSettings}"
    >
        <v-img
            v-if="story.titleImage"
            :src="story.titleImage"
            :alt="story.title"
            eager
            height="95px"
            @load="reloadMasonry"
        />

        <v-row class="card-header">
            <v-col cols="11">
                <v-card-title class="card-title">
                    {{ story.title }}
                </v-card-title>
                <v-card-subtitle class="card-subtitle">
                    <v-icon small>
                        {{ icons.mdiAccountOutline }}
                    </v-icon>
                    {{ story.author }}
                </v-card-subtitle>
            </v-col>

            <v-col cols="1">
                <FeaturedButton
                    :story-id="story._id"
                    :is-featured="story.featured"
                    :is-admin="isAdmin"
                />
                <ShareButton
                    :story-id="story._id"
                    v-on="$listeners"
                />
            </v-col>
        </v-row>

        <v-card-text class="card-text">
            {{ story.description }}
        </v-card-text>

        <v-card-actions class="card-actions">
            <v-row>
                <v-col>
                    <EditButton
                        v-if="editable()"
                        :story-id="story._id"
                    />
                    <DeleteButton
                        v-if="editable()"
                        :story-id="story._id"
                        v-on="$listeners"
                    />
                    <ShareSettingsButton
                        v-if="editable()"
                        :story="story"
                        @toggle:shared-settings="shareSettings = !shareSettings"
                        v-on="$listeners"
                    />
                </v-col>
                <v-col class="play-button">
                    <PlayButton :story-id="story._id" />
                </v-col>
            </v-row>
        </v-card-actions>


        <ShareSettingsForm
            v-if="shareSettings"
            :story="story"
            @close:shared-settings="shareSettings = false"
            v-on="$listeners"
        />
    </v-card>
</template>

<style lang="scss" scoped>

.topper {
    z-index: 1000;
}
.grid-item {
    width: 100%;

    flex: 0 0 100%;
    max-width: 100%;

    border-radius: 5px;
    border: 1px solid rgba(0, 0, 0, 0.40);


    @media (min-width: 768px){
        flex: 0 0 calc(50% - 20px);
        max-width: calc(50% - 20px)
    }

    @media(min-width: 992px) {
        flex: 0 0 calc(33.3333333333% - 20px);
        max-width: calc(33.3333333333% - 20px);
    }

    @media(min-width: 1800px) {
        flex: 0 0 calc(25% - 20px);
        max-width: calc(25% - 20px);
    }

}

.card-header {
    padding: 10px 12px 0 12px;
    margin-bottom: 5px !important;

    .card-title {
        padding: 0;
    }

    .card-subtitle {
        padding: 12px 0 0 0;
    }
}

.card-text {
    padding: 0 12px;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.card-actions {
    padding: 8px 12px 8px 12px;
}

.play-button {
    justify-content: end;
    display: flex;
}
</style>
