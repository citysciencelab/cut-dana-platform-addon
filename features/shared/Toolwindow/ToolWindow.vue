<script setup>
import {useDashboard} from "../../dashboard/hooks/useDashboard";
import {ToolwindowModes as toolwindowModes} from "../../../store/contantsDataNarrator";
import {useDataNarrator} from "../../../hooks/useDataNarrator";
import BottomSheet from "./BottomSheet.vue";

const {open} = useDashboard();
const {toolwindowMode} = useDataNarrator();
</script>

<template>
    <div :class="['toolwindow-container', toolwindowMode]">
        <div :class="['toolwindow-between', toolwindowMode]">
            <BottomSheet :active="toolwindowMode === toolwindowModes.MOBILE">
                <div :class="['toolwindow', {'with-top-border-radius': toolwindowMode !== toolwindowModes.MOBILE}]">
                    <header>
                        <slot v-if="$slots.header" name="header"/>
                    </header>
                    <main
                        :class="[$slots.fixed ? 'slot-fixed' : 'slot', open ? '' : 'removed', { mobile: toolwindowMode === toolwindowModes.MOBILE }]">
                        <slot name="default"/>
                        <slot name="fixed"/>
                    </main>
                    <footer class="footer">
                        <slot v-if="$slots.footer" name="footer"/>
                    </footer>
                </div>
            </BottomSheet>
        </div>
    </div>
</template>
