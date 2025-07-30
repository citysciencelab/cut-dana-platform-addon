<script setup>
import {useDashboard} from "../../dashboard/hooks/useDashboard";
import {ToolwindowModes as toolwindowModes} from "../../../store/contantsDataNarrator";
import DragHandle from "./DragHandle.vue";
import {useDataNarrator} from "../../../hooks/useDataNarrator";
import {useToolWindow} from "./hooks/useToolWindow";

const {open, setOpen} = useDashboard();
const {toolwindowMode} = useDataNarrator();
</script>

<template>
    <div :class="['toolwindow-container', toolwindowMode]">
        <div :class="['toolwindow-between', toolwindowMode]">
            <div :class="['toolwindow', {'with-top-border-radius': toolwindowMode !== toolwindowModes.MOBILE}]">
                <DragHandle v-if="toolwindowMode === toolwindowModes.MOBILE" @click="setOpen" />
                <header>
                    <slot v-if="$slots.header" name="header" />
                </header>
                <main :class="['slot', open ? '' : 'removed']">
                    <slot />
                </main>
                <footer class="footer">
                    <slot v-if="$slots.footer" name="footer" />
                </footer>
            </div>
        </div>
    </div>
</template>

