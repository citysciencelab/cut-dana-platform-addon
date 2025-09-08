<script setup>
import {mdiFormatListBulleted, mdiPlus} from "@mdi/js";

import ChapterStep from "./ChapterStep.vue";
import {numberToLetter} from "../../../../utils/numberToLetter";

const props = defineProps({
    chapter: {
        type: Object,
        required: true
    },
    activeStepIndex: {
        type: Number,
        required: true,
    }
});

const emits = defineEmits(["addNewChapter", "addNewStep"]);

function getDefaultStep(id) {
    return {
        id,
        title: "",
        description: "",
        mapConfig: {
            centerCoordinates: [0, 0],
            zoomLevel: 0,
            backgroundMapId: null,
        },
        informationLayerIds: []
    };
}

function addStep() {
    props.chapter.steps.push(getDefaultStep(props.chapter.steps.length + 1));
    emits("addNewStep");
}
</script>

<template>
    <div v-if="chapter" class="chapter-container">
        <div class="chapter">
            <v-icon>{{ mdiFormatListBulleted }}</v-icon>
            <div class="chapter-label">{{ numberToLetter(props.chapter.sequence) }}</div>
            <div class="chapter-title">
                <input
                    type="text"
                    placeholder="A Unbenanntes Kapitel"
                    v-model="props.chapter.title"
                    required
                />
            </div>
            <div class="chapter-step-add" @click="emits('addNewChapter')">
                <v-icon>{{ mdiPlus }}</v-icon>
            </div>
        </div>

        <ChapterStep
            v-if="props.activeStepIndex > -1 && props.activeStepIndex < props.chapter.steps.length"
            :step="props.chapter.steps[props.activeStepIndex]"
        />

        <v-row justify="center">
            <v-btn variant="plain" class="mt-2" @click="addStep">
                <template v-slot:prepend>
                    <div class="add-chapter-button-icon">
                        <v-icon>{{ mdiPlus }}</v-icon>
                    </div>
                </template>
                SCHRITT HINZUFÜGEN
            </v-btn>
        </v-row>
    </div>
</template>

<style lang="scss" scoped>
.chapter-container {
    .chapter {
        display: flex;
        align-items: center;
        gap: 6px;
        background-color: white;
        border-radius: 50px;
        padding: 8px;

        &-label {
            background-color: #413fab;
            padding: 2px 16px;
            border-radius: 20px;
            font-size: 16px;
            font-weight: bold;
            color: white;
        }

        &-title {
            flex: 1;

            input[type="text"] {
                border: none;
                border-bottom: 1px solid #e1e1e1;
                outline: none;
                font-size: 16px;
                font-weight: bold;
                width: 80%;

                &:focus {
                    border-bottom: 1px solid #a1a1a1;
                }
            }
        }

        &-step-add {
            border: 2px solid #883d06;
            padding: 0 10px;
            border-radius: 20px;
            font-size: 16px;
            font-weight: bold;
            color: #883d06;
            cursor: pointer;
        }
    }

    .add-chapter-button-icon {
        border: 2px solid #226051;
        padding: 0 10px;
        border-radius: 20px;
        font-size: 16px;
        font-weight: bold;
        color: #226051;
        cursor: pointer;
    }
}
</style>
