<script setup>
import { useTranslation } from 'i18next-vue';

defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const { t } = useTranslation();
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="three-d-hint"
    >
      {{ t('additional:modules.dataNarrator.hint.ctrl3D') }}
    </div>
  </Teleport>
</template>

<style scoped>
.three-d-hint {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 500;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  padding: 8px 22px;
  border-radius: 999px;
  font-size: 13px;
  pointer-events: none;
  white-space: nowrap;
  backdrop-filter: blur(4px);
}
</style>
