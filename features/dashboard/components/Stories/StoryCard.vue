<script setup>

import {defineComponent} from "vue";
import PlayButton from "./PlayButton.vue";
import EditButton from "./EditButton.vue";
import AuthorDisplay from "./Author.vue";
import ShareButton from "./ShareButton.vue";
import FeaturedButton from "./FeaturedButton.vue";
import DeleteButton from "./DeleteButton.vue";
import ShareSettingsButton from "./ShareSettingsButton.vue";
import ShareSettingsForm from "./ShareSettingsForm.vue";
import {backendUrl} from "../../../../store/contantsDataNarrator";

const props = defineProps({
    story: {
        type: Object,
        required: true
    },
    shareSettings: {
        type: Boolean,
        default: false
    },
});

function reloadMasonry () {

}

function getFileUrl (titleImage) {
    return `${backendUrl}/files/${titleImage.fileContext}/${titleImage.filename}`;
}

function editable () {
    // TODO:Jonas implement this
    return true;
}
</script>

<template>
    <v-card
        class="mb-5"
        variant="flat"
        :class="{'grid-item': true, 'topper': shareSettings}"
    >
        <v-img
            v-if="story.titleImage"
            :src="getFileUrl(story.titleImage)"
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
                <AuthorDisplay :authorId="story.author" />
            </v-col>

            <v-col cols="1">
                <FeaturedButton
                    :story-id="story.id"
                    :is-featured="story.featured"
                    :is-admin="false"
                />
                <ShareButton
                    :story-id="story.id"
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
                        :story-id="story.id"
                    />
                    <DeleteButton
                        v-if="editable()"
                        :story-id="story.id"
                    />
                    <ShareSettingsButton
                        v-if="editable()"
                        :story="story"
                        @toggle:shared-settings="shareSettings = !shareSettings"
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
    line-clamp: 4;
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
