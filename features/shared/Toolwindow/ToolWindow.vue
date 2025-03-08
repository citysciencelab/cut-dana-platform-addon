<template>
    <div :class="['toolwindow-container', toolwindowMode]">
        <div :class="['toolwindow-between', toolwindowMode]">
            <div :class="['toolwindow', {'with-top-border-radius': toolwindowMode !== toolwindowModes.MOBILE}]" :style="{padding: `${toolWindowPadding}px`}">
                <DragHandle v-if="toolwindowMode === toolwindowModes.MOBILE" @click="setIsOpen" />
                <header>
                    <slot name="header"/>
                </header>
                <main :class="['slot', isOpen ? '' : 'removed']">
                    <slot />
                </main>
                <footer class="footer">
                    <slot name="footer" />
                </footer>
            </div>
        </div>
    </div>
</template>
<script setup>

import {useDataNarrator} from "../../dashboard/hooks/useDashboard";
import {ToolwindowModes as toolwindowModes} from "../../../store/contantsDataNarrator";
import DragHandle from "./DragHandle.vue";

const {toolwindowMode, toolWindowPadding, setIsOpen, isOpen} = useDataNarrator();
</script>
