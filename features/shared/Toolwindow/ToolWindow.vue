<script setup>
import {useDashboard} from "../../dashboard/hooks/useDashboard";
import {ToolwindowModes as toolwindowModes} from "../../../store/contantsDataNarrator";
import DragHandle from "./DragHandle.vue";
import {useDataNarrator} from "../../../hooks/useDataNarrator";
import {useToolWindow} from "./hooks/useToolWindow";

const {setIsOpen, isOpen} = useDashboard();
const {toolwindowMode, toolWindowPadding} = useDataNarrator();
const {setToolWindowMode} = useToolWindow();
</script>

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

