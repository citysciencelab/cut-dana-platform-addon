<script setup>
//
import CreateStoryHeader from "./CreateStoryHeader.vue";
import StoryForm from "./StoryForm.vue";
import * as contantsDataNarrator from "../../../store/contantsDataNarrator";
import {useDashboard} from "../../dashboard/hooks/useDashboard";
import ToolWindow from "../../shared/Toolwindow/ToolWindow.vue";


const {gotoPage} = useDashboard();

function saveStory() {
    console.log("Save story");
}
</script>

<template>

    <ToolWindow>
        <template #header>
            <CreateStoryHeader />
        </template>
        <template #default>
            <div id="tool-dataNarrator-creator-stepForm">
                <StoryForm />
            </div>
        </template>
        <template #footer>
            <div class="actions-container">
                <v-btn @click="gotoPage(contantsDataNarrator.dataNarratorModes.DASHBOARD)">Cancel</v-btn>
                <v-btn @click="saveStory">Save</v-btn>
            </div>
        </template>
    </ToolWindow>
</template>

<style scoped lang="scss">
.actions-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: .2rem;
}
</style>
