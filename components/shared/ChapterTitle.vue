<script>
import RenderUtilities from "../../mixins/RenderUtilities";
import * as constants from "../../store/constantsDataNarrator";

export default {
    name: "ChapterTitle",
    mixins: [RenderUtilities],
    props: {
        chapter: {
            type: Object,
            default: null
        },
        isEditable: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            constants
        };
    }

};
</script>

<template>
    <v-row
        class="mt-1 mb-1"
    >
        <v-list-item
            :key="`chapter_${chapter.chapterNumber}`"
            class="chapter-item"
            @click="$emit('click')"
            @keydown="$emit('click')"
        >
            <v-col cols="1">
                <v-btn
                    :key="chapter.chapterNumber"
                    class="story-step-button pill-button horizontal chapter-indicator"
                    :style="{backgroundColor: colorFor(chapter.chapterNumber).main} "
                    icon
                    :title="
                        $t(
                            'additional:modules.tools.dataNarrator.label.chapter'
                        )
                    "
                >
                    {{ chapterLetter(chapter.chapterNumber ) }}
                </v-btn>
            </v-col>
            <v-col
                cols="9"
            >
                <v-list-item-title class="chapter-title">
                    {{ chapter.chapterTitle }}
                </v-list-item-title>
            </v-col>
            <v-col
                cols="1"
                offset="1"
                class="d-flex justify-center align-self-center"
            >
                <v-btn
                    v-show="isEditable"
                    class="story-step-button pill-button horizontal add-step"
                    icon
                    :title="
                        $t(
                            'additional:modules.tools.dataNarrator.button.addStep'
                        )
                    "
                    @click="
                        $emit(
                            'openView',
                            constants.storyCreationViews.STEP_CREATION, chapter.chapterNumber
                        )
                    "
                >
                    <v-icon>add</v-icon>
                </v-btn>
            </v-col>
        </v-list-item>
    </v-row>
</template>

<style scoped lang="scss">
.chapter-item {
    min-height: 20px;
    padding: 0;
}

.chapter-title {
    font-weight: bold;
    font-size: 1.2em;
    position: relative;
    top: 2px;
}

</style>
