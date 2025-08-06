<script setup>
import PlayButton from "./PlayButton.vue";
import EditButton from "./EditButton.vue";
import AuthorDisplay from "./Author.vue";
import ShareButton from "./ShareButton.vue";
import FeaturedButton from "./FeaturedButton.vue";
import DeleteButton from "./DeleteButton.vue";
import ShareSettingsButton from "./ShareSettingsButton.vue";
import ShareSettingsForm from "./ShareSettingsForm.vue";
import {backendUrl, dataNarratorModes} from "../../../../store/contantsDataNarrator";
import {useDataNarrator} from "../../../../hooks/useDataNarrator";
import {useStory} from "../../../stories/hooks/useStory";

const {gotoPage} = useDataNarrator();
const { currentStoryId } = useStory();

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

function getFileUrl (titleImage) {
    return `${backendUrl}/files/${titleImage.fileContext}/${titleImage.filename}`;
}

async function playStory() {
    currentStoryId.value = props.story.id;
    gotoPage(dataNarratorModes.PLAY_STORY);
}
</script>

<template>
    <v-card
        class="story-card"
        variant="flat"
    >
        <div
            v-if="story.titleImage"
            class="story-card-cover"
            :style="`background-image: url(${getFileUrl(story.titleImage)});`"
        />

        <div class="card-header">
            <div class="card-header-title">
                <div class="card-header-title-text">
                    {{ story.title }}
                </div>
                <AuthorDisplay :authorId="story.author" />
            </div>

            <div class="card-header-actions">
                <FeaturedButton
                    :story-id="story.id"
                    :is-featured="story.featured"
                    :is-admin="false"
                />
                <ShareButton
                    :story-id="story.id"
                />
            </div>
        </div>

        <v-card-text class="card-text">
            {{ story.description }}
        </v-card-text>

        <v-card-actions class="card-actions">
            <v-row>
                <v-col>
                    <EditButton
                        v-if="false"
                        :story-id="story.id"
                    />
                    <DeleteButton
                        v-if="false"
                        :story-id="story.id"
                    />
                    <ShareSettingsButton
                        v-if="false"
                        :story="story"
                        @toggle:shared-settings="shareSettings = !shareSettings"
                    />
                </v-col>
                <v-col class="play-button">
                    <PlayButton :story-id="story._id" @click="playStory" />
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
.story-card {
    border:  1px solid rgba(0, 0, 0, 0.40);
    border-radius: 5px;

    &-cover {
        width: 100%;
        height: 180px;
        aspect-ratio: 16 / 9;
        background-color: #f1f1f1;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        border-radius: 5px;
    }
}

.card-header {
    padding: 10px 12px;
    display: flex;
    align-items: center;

    .card-header-title {
        flex: 1;

        &-text {
            font-weight: bold;
            text-transform: capitalize;
            font-size: 24px;
        }
    }

    .card-header-actions {
        display: flex;
        align-items: center;
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
    padding: 0;
}

.play-button {
    justify-content: end;
    display: flex;
}
</style>
