<script setup>
//
import CreateStoryHeader from "./CreateStoryHeader.vue";
import StoryForm from "./StoryForm.vue";
import * as contantsDataNarrator from "../../../store/contantsDataNarrator";
import Toolwindow from "../../shared/Toolwindow/ToolWindow.vue";
import {useDataNarrator} from "../../dashboard/hooks/useDashboard";

const {gotoPage} = useDataNarrator();

function saveStory() {
    console.log("Save story");
}
</script>

<template>
    <Toolwindow>
        <template #header>
            <CreateStoryHeader />
        </template>
        <template #default>
            <div id="tool-dataNarrator-creator-storyForm">
                <StoryForm />
            </div>
        </template>
        <template #footer>
            <div class="actions-container">
                <v-btn @click="gotoPage(contantsDataNarrator.dataNarratorModes.DASHBOARD)">Cancel</v-btn>
                <v-btn @click="saveStory">Save</v-btn>
            </div>
        </template>
    </Toolwindow>
</template>

<style scoped lang="scss">
.actions-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: .2rem;
}
</style>
