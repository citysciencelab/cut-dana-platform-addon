<script setup>
import CreateStoryHeader from "./CreateStoryHeader.vue";
import StoryForm from "./StoryForm.vue";
import * as contantsDataNarrator from "../../../store/contantsDataNarrator";
import ToolWindow from "../../shared/Toolwindow/ToolWindow.vue";
import {useDataNarrator} from "../../../hooks/useDataNarrator";
import {useStoryForm} from "../hooks/useStoryForm";
const {gotoPage} = useDataNarrator();
const {createStory} = useStoryForm();

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
                <v-btn @click="createStory">Save</v-btn>
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
