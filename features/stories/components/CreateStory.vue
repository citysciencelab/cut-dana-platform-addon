<script setup>
//
import CreateStoryHeader from "./CreateStoryHeader.vue";
import StoryForm from "./StoryForm.vue";
import * as contantsDataNarrator from "../../../store/contantsDataNarrator";
import {useDataNarrator} from "../../dashboard/hooks/useDashboard";
import {ToolwindowModes as toolwindowModes} from "../../../store/contantsDataNarrator";
import DragHandle from "../../shared/Toolwindow/DragHandle.vue";
const {toolwindowMode, toolWindowPadding, setIsOpen, isOpen, gotoPage} = useDataNarrator();

function saveStory() {
    console.log("Save story");
}
</script>

<template>
    <div :class="['toolwindow-container', toolwindowMode]">
        <div :class="['toolwindow-between', toolwindowMode]">
            <div :class="['toolwindow', {'with-top-border-radius': toolwindowMode !== toolwindowModes.MOBILE}]" :style="{padding: `${toolWindowPadding}px`}">
                <DragHandle v-if="toolwindowMode === toolwindowModes.MOBILE" @click="setIsOpen" />
                <CreateStoryHeader />
                <div :class="['slot', isOpen ? '' : 'removed']">
                    <div id="tool-dataNarrator-creator-stepForm">
                        <StoryForm />
                    </div>
                </div>
                <div class="footer">
                    <div class="actions-container">
                        <v-btn @click="gotoPage(contantsDataNarrator.dataNarratorModes.DASHBOARD)">Cancel</v-btn>
                        <v-btn @click="saveStory">Save</v-btn>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.actions-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: .2rem;
}
</style>
