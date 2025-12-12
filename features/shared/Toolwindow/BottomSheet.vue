<script setup>
import { motion, useDragControls } from 'motion-v';
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue';

const sheet = ref(null);
const bottom = ref(0);
const controls = useDragControls();

const props = defineProps({
    active: {
        type: Boolean,
        required: true,
    }
});

function updateHeight() {
    bottom.value = window.innerHeight - 100;
}

onMounted(() => {
    updateHeight();
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
      :drag-constraints="{ top: 0, bottom }"
      :initial="{ y: '33%' }"
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
