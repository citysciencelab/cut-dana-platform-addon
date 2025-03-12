<script setup>

import ToolWindow from "../../shared/Toolwindow/ToolWindow.vue";
import ChapterForm from "./ChapterForm.vue";

const createChapter = async () => {}

</script>

<template>
    <ToolWindow>
        <template v-slot:header>
            <div>chapter header</div>
        </template>
        <template v-slot:default>
            <div id="tool-dataNarrator-creator-stepForm">
                <ChapterForm />
            </div>
        </template>
        <template v-slot:footer>
            <div class="actions-container">
                <v-btn @click="createChapter">Save</v-btn>
            </div>
        </template>
    </ToolWindow>
</template>

<style scoped lang="scss">

</style>
