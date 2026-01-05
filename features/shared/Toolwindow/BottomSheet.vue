<script setup>
import { motion, useDragControls } from 'motion-v';
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useStore } from 'vuex';

import * as constants from '../../../store/contantsDataNarrator.js';
const store = useStore();
const storiesDisplayMode = computed(() => store.state.Modules.DataNarrator.mode);

// 44: offset of login button (8px) times 2 (top and bottom) + login button height (28px)
const topOffset = 44;
const sheet = ref(null);
const top = ref(topOffset);
const bottom = ref(0);
const y = ref('33%');
const controls = useDragControls();

const props = defineProps({
  active: {
    type: Boolean,
    required: true,
  }
});

function updateHeight(topValue) {
  const viewportHeight = window.innerHeight;
  if (window.screen.height === window.outerHeight) {
    // Fullscreen mode
    top.value = topValue ?? topOffset;
    bottom.value = viewportHeight - 100;
    return;
  }
  const browserChromeHeight = window.screen.height - window.innerHeight;
  bottom.value = viewportHeight - 100 + topOffset;
  top.value = topValue ?? browserChromeHeight;
}

onMounted(() => {
  const isDashBoardMode = storiesDisplayMode.value === constants.dataNarratorModes.DASHBOARD;
  if (!isDashBoardMode) {
    // maximize tooltip window
    y.value = 5;
  }
  updateHeight(isDashBoardMode ? undefined : 5);
  window.addEventListener('resize', updateHeight);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateHeight);
});
</script>

<template>
  <div
    v-if="props.active"
    class="overlay"
    @click.self="close"
  >
    <motion.div
      ref="sheet"
      class="sheet"
      drag="y"
      :drag-controls="controls"
      :drag-listener="false"
      :drag-constraints="{ top, bottom }"
      :drag-elastic="0.1"
      :initial="{ y }"
    >
      <motion.div
        class="drag-handle-container"
        @pointerdown="(event) => controls.start(event)"
      >
        <div class="drag-handle" />
      </motion.div>
      <slot />
    </motion.div>
  </div>
  <slot v-else />
</template>

<style lang="scss" scoped>
.overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1000;
}

.sheet {
  width: 100%;
}

.drag-handle-container {
  padding: 20px;
  position: absolute;
  width: 100%;
  top: 0;
  z-index: 1000;
  touch-action: none;
  pointer-events: auto;

  .drag-handle {
    width: 40px;
    height: 4px;
    background: #ccc;
    border-radius: 2px;
    margin: 0 auto 8px;
  }
}
</style>
