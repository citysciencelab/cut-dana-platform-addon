<script>

import DataNarratorWindowMixins from "../../mixins/DataNarratorWindowMixins";
import DragHandle from "./components/DragHandle.vue";
import * as constants from "../../store/contantsDataNarrator";

export default {
    name: "Toolwindow",
    components: {DragHandle},
    mixins: [DataNarratorWindowMixins],
    data () {
        return {
            toolWindowPadding: constants.dataNarratorToolSettings.toolWindowPadding,
        };
    },
};
</script>

<template lang="html">
    <div class="toolwindow-container">
        <div class="toolwindow-between">
            <div :class="['toolwindow', isMobile ? 'mobile' : '']" :style="{padding: `${toolWindowPadding}px`}">
                <DragHandle />
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.toolwindow-container {
    grid-column: 2;
    padding-top: 20px;

    .toolwindow-between {
        width: 100%;
        height: 100%;
        position: relative;

        .toolwindow {
            pointer-events: auto;
            background-color: white;
            border-radius: .2rem;
            box-shadow: 0 12px 30px -8px rgba(0,0,0,0.30);
            position: absolute;
            width: 100%;

            &.mobile {
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
}
</style>
