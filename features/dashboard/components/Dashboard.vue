<script setup>


import DashboardHeader from "./DashboardHeader.vue";
import DashboardContent from "./DashboardContent.vue";
import {ToolwindowModes as toolwindowModes} from "../../../store/contantsDataNarrator";
import DragHandle from "../../shared/Toolwindow/DragHandle.vue";
import {useDataNarrator} from "../hooks/useDashboard";

const {toolwindowMode, toolWindowPadding, setIsOpen, isOpen} = useDataNarrator();

</script>

<template>

    <div :class="['toolwindow-container', toolwindowMode]">
        <div :class="['toolwindow-between', toolwindowMode]">
            <div :class="['toolwindow', {'with-top-border-radius': toolwindowMode !== toolwindowModes.MOBILE}]" :style="{padding: `${toolWindowPadding}px`}">
                <DragHandle v-if="toolwindowMode === toolwindowModes.MOBILE" @click="setIsOpen" />
                <DashboardHeader />
                <div :class="['slot', isOpen ? '' : 'removed']">
                    <div id="tool-dataNarrator-creator-stepForm">
                        <DashboardContent />
                    </div>
                </div>
                <div class="footer">
                    <div>test</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>

</style>
