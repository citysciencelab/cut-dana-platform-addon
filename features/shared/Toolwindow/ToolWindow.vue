<script setup>

import {useDataNarrator} from "../../dashboard/hooks/useDashboard";
import {ToolwindowModes as toolwindowModes} from "../../../store/contantsDataNarrator";
import DragHandle from "./DragHandle.vue";

const {toolwindowMode, toolWindowPadding, setIsOpen, isOpen} = useDataNarrator();

</script>

<template lang="html">
    <div :class="['toolwindow-container', toolwindowMode]">
        <div :class="['toolwindow-between', toolwindowMode]">
            <div :class="['toolwindow', toolwindowMode === toolwindowModes.MOBILE ?? 'with-top-border-radius']" :style="{padding: `${toolWindowPadding}px`}">
                <DragHandle v-if="toolwindowMode === toolwindowModes.MOBILE" @click="setIsOpen" />
                <slot name="header"></slot>
                <div :class="['slot', isOpen ? '' : 'removed']">
                    <slot></slot>
                </div>
                <div class="footer">
                    <slot name="footer" ></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.toolwindow-container {
    grid-column: 2 / 3;
    width: 100%;
    height: 100%;
    position: absolute;

    &.desktop {
        grid-column: 1 / 2;
    }

    .toolwindow-between {
        width: 100%;
        height: 100%;

        &.desktop {
            display: flex;
        }

        &.dashboard {
            display: flex;

            .toolwindow {
                height: 100%;
                overflow-y: scroll;
            }
        }

        &.mobile {

        }

        .toolwindow {
            pointer-events: auto;
            background-color: white;
            border-radius: .8rem;
            box-shadow: 0 12px 30px -8px rgba(0,0,0,0.30);
            position: absolute;
            width: 100%;
            margin-top: 2rem;

            transition: height 1s ease-in;

            .slot {
                overflow-y: scroll;

                &.removed {
                    opacity: 0;
                    height: 0;
                    padding: 0; /* Ensure padding collapse for height reduction */
                    margin: 0;
                    //transition: opacity 0.3s ease-in, height 0.1s ease, padding 0.1s ease, margin 0.1s ease;
                }
            }

            &.with-top-border-radius  {
                border-top-left-radius: 1rem;
                border-top-right-radius: 1rem;
            }
        }
    }

    &.left {
        grid-column: 1;
    }

    &.right {
        grid-column: 3;
    }

    .footer {
        padding: 1rem;
    }
}
</style>
