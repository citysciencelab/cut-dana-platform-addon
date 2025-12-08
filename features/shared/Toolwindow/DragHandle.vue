<script setup>
// import {useIsMobile} from "../../../hooks/useIsMobile";
// import {onMounted, onUnmounted, ref, watch} from "vue";
// import {useDataNarrator} from "../../dashboard/hooks/useDashboard";
// import * as constants from "../../../store/contantsDataNarrator";
//
// const {} = useDataNarrator();
//
// let toolWindow = ref(document.querySelectorAll(".toolwindow-container .toolwindow")[0])
// let draggable = ref(null);
// let isDragging = ref(false);
// let initialOffset = ref(0);
// let bottomOffset = ref(constants.dataNarratorToolSettings.bottomOffset);
// let offsetX = ref(0);
// let offsetY = ref(0);
//
// const {isMobile} = useIsMobile();
//
// function touchStart (e) {
//     isDragging = true;
//     const touch = e.touches[0];
//
//     offsetX = touch.clientX - toolWindow.offsetLeft;
//     offsetY = touch.clientY - toolWindow.offsetTop;
// }
//
// function touchEnd () {
//     this.isDragging = false;
// }
//
// function touchMove (e) {
//     if (isDragging) {
//         const currentToolTop = toolWindow.offsetTop,
//             currentToolBottom = toolWindow.offsetTop + toolWindow.offsetHeight,
//             targetLocation = e.touches[0].clientY - 30,
//             isDirectionDown = currentToolTop <= targetLocation;
//
//         // check if the window is inside bounds
//         if (targetLocation > 0 && targetLocation < window.innerHeight) {
//             if (isDirectionDown && currentToolBottom > window.innerHeight - this.bottomOffset) {
//                 return;
//             }
//             toolWindow.style.top = `${targetLocation}px`;
//         }
//     }
// }
//
// watch(isMobile, (newVal) => {
//     if (newVal) {
//         enableEventListeners();
//     } else {
//         disableEventListeners();
//     }
// });
//
// onMounted(() => {
//     enableEventListeners();
// });
//
// onUnmounted(() => {
//     disableEventListeners();
// });
//
//
// function enableEventListeners () {
//     this.$refs["header-draggable-container"].addEventListener("touchstart", this.touchStart);
//     document.addEventListener("touchmove", touchMove);
//     document.addEventListener("touchend", touchEnd);
// }
//
// function disableEventListeners () {
//     this.$refs["header-draggable-container"].removeEventListener("touchstart", this.touchStart);
//     document.removeEventListener("touchend", touchEnd);
//     document.removeEventListener("touchmove", touchMove);
// }
</script>

<template>
  <!--    <div-->
  <!--        ref="header-draggable-container"-->
  <!--        :class="['header-draggable-container', {mobile: isMobile}]"-->
  <!--    >-->
  <!--        <div class="header-draggable" />-->
  <!--    </div>-->

  <div />
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
