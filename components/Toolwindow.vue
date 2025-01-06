<script>

import DataNarratorWindowMixins from "../mixins/DataNarratorWindowMixins";

export default {
    name: "Toolwindow",
    mixins: [DataNarratorWindowMixins]
};
</script>

<template lang="html">
    <div class="toolwindow-container">
        <div class="toolwindow">
            <slot></slot>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.toolwindow-container {
    grid-column: 2;
    padding: 20px;

    &.left {
        grid-column: 1;
    }

    &.right {
        grid-column: 3;
    }

    .toolwindow {
        pointer-events: auto;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 13px 33px -8px rgba(0,0,0,0.57);
        padding: 10px;
    }
}
</style>
