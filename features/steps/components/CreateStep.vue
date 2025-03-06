<script setup>

import StepForm from "./StepForm.vue";
import {ToolwindowModes as toolwindowModes} from "../../../store/contantsDataNarrator";
import {useDataNarrator} from "../../dashboard/hooks/useDashboard";
import DragHandle from "../../shared/Toolwindow/DragHandle.vue";

const {toolwindowMode, toolWindowPadding, setIsOpen, isOpen} = useDataNarrator();
</script>

<template>

    <div :class="['toolwindow-container', toolwindowMode]">
        <div :class="['toolwindow-between', toolwindowMode]">
            <div :class="['toolwindow', {'with-top-border-radius': toolwindowMode !== toolwindowModes.MOBILE}]" :style="{padding: `${toolWindowPadding}px`}">
                <DragHandle v-if="toolwindowMode === toolwindowModes.MOBILE" @click="setIsOpen" />
                <div>header</div>
                <div :class="['slot', isOpen ? '' : 'removed']">
                    <div id="tool-dataNarrator-creator-stepForm">
                        <StepForm />
                    </div>
                </div>
                <div class="footer">
                    <div class="actions-container" />
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
