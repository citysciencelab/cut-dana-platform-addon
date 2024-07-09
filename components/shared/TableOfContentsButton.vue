<script>
import RenderUtilities from "../../mixins/RenderUtilities";

export default {
    name: "TableOfContentsButton",
    mixins: [RenderUtilities],
    props: {
        chapter: {
            type: Object,
            default: null
        }
    }

};
</script>

<template>
    <span
        :key="`chapter_${chapter.chapterNumber}`"
        class="chapter-item"
    >
        <span
            role="button"
            tabindex="0"
        >
            <v-tooltip left>
                <template #activator="{ on, attrs }">
                    <v-icon
                        v-bind="attrs"
                        v-on="on"
                        @click="$emit('click')"
                        @keydown="$emit('click')"
                    >list</v-icon>
                </template>
                <span>{{ $t("additional:modules.tools.dataNarrator.tableOfContents") }}</span>
            </v-tooltip>
        </span>
        <v-btn
            :key="chapter.chapterNumber"
            class="story-step-button pill-button horizontal chapter-indicator"
            :style="{backgroundColor: colorFor(chapter.chapterNumber).main}"
            icon
            :title="
                $t(
                    'additional:modules.tools.dataNarrator.label.chapter'
                )
            "
        >
            {{ chapterLetter(chapter.chapterNumber ) }}
        </v-btn>
        <span class="chapter-title">
            {{ chapter.chapterTitle }}
        </span>
    </span>
</template>

<style scoped lang="scss">
.chapter-item {
    min-height: 30px;
    padding: 0;
    cursor: pointer;
}

.chapter-title {
    font-weight: bold;
}

</style>
