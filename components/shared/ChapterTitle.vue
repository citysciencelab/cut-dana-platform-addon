<script>
import RenderUtilities from "../../mixins/RenderUtilities";

export default {
    name: "ChapterTitle",
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
    <v-list-item
        :key="`chapter_${chapter.chapterNumber}`"
        class="chapter-item"
        @click="$emit('click')"
        @keydown="$emit('click')"
    >
        <v-chip
            :color="colorFor(chapter.chapterNumber).main"
            text-color="white"
            class="chapter-chip"
        >
            {{ chapterLetter(chapter.chapterNumber) }}
        </v-chip>
        <v-list-item-title class="chapter-title">
            {{ chapter.chapterTitle }}
        </v-list-item-title>
    </v-list-item>
</template>

<style scoped lang="scss">
.chapter-chip {
    height: 18px;
    font-weight: bold;
    margin-right: 10px;
    justify-content: center;
}
.chapter-item {
    min-height: 30px;
    padding: 0;
}

.chapter-title {
    font-weight: bold;
}

</style>
