<script>
import * as constants from "../../../store/contantsDataNarrator";
import DataNarratorWindowMixins from "../../../mixins/DataNarratorWindowMixins";


export default {
    name: "DragHandle",
    mixins: [DataNarratorWindowMixins],
    props: {

    },

    data () {
        return {
            toolWindow: null,
            draggable: null,
            isDragging: false,
            initialOffset: 0,
            bottomOffset: constants.dataNarratorToolSettings.bottomOffset
        };
    },

    watch: {
        isMobile () {
            if (this.isMobile) {
                this.enableEventListeners();
            }
            else {
                this.disableEventListeners();
            }
        }
    },

    beforeDestroy () {
        this.disableEventListeners();
    },

    mounted () {
        this.toolWindow = document.querySelectorAll(".toolwindow-container .toolwindow")[0];
        this.enableEventListeners();
        this.moveTool();
    },

    methods: {
        enableEventListeners () {
            this.$refs["header-draggable-container"].addEventListener("touchstart", this.touchStart);
            document.addEventListener("touchmove", this.touchMove);
            document.addEventListener("touchend", this.touchEnd);
        },

        disableEventListeners () {
            this.$refs["header-draggable-container"].removeEventListener("touchstart", this.touchStart);
            document.removeEventListener("touchend", this.touchEnd);
            document.removeEventListener("touchmove", this.touchMove);
        },

        touchStart (e) {
            this.isDragging = true;
            const touch = e.touches[0];

            this.offsetX = touch.clientX - this.toolWindow.offsetLeft;
            this.offsetY = touch.clientY - this.toolWindow.offsetTop;
        },

        touchEnd () {
            this.isDragging = false;
        },

        touchMove (e) {
            if (this.isDragging) {
                const currentToolTop = this.toolWindow.offsetTop,
                    currentToolBottom = this.toolWindow.offsetTop + this.toolWindow.offsetHeight,
                    targetLocation = e.touches[0].clientY - 30,
                    isDirectionDown = currentToolTop <= targetLocation;

                // check if the window is inside bounds
                if (targetLocation > 0 && targetLocation < window.innerHeight) {
                    if (isDirectionDown && currentToolBottom > window.innerHeight - this.bottomOffset) {
                        return;
                    }
                    this.toolWindow.style.top = `${targetLocation}px`;
                }
            }
        }
    }

};
</script>

<template>
    <div
        ref="header-draggable-container"
        :class="['header-draggable-container', {mobile: isMobile}]"
    >
        <div class="header-draggable" />
    </div>
</template>

<style scoped lang="scss">
.header-draggable-container {
    position: sticky;
    border-radius: 99999px;
    top: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 30;

    height: 0;
    opacity: 0;
    padding: 0;
    pointer-events: none;

    .header-draggable {
        position: static;
        width: 40px;
        height: 4px;
        background-color: gray;
        border-radius: 20rem;
        cursor: grab;
        touch-action: none;
    }

    &.mobile {
        height: auto;
        opacity: 1;
        padding: 6px;
        pointer-events: auto;
    }
}
</style>
