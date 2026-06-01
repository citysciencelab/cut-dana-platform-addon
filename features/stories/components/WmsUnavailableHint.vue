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
      class="wms-unavailable-hint"
    >
      {{ t('additional:modules.dataNarrator.hint.wmsUnavailable') }}
    </div>
  </Teleport>
</template>

<style scoped>
.wms-unavailable-hint {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 500;
  background: rgba(180, 30, 30, 0.75);
  color: #fff;
  padding: 8px 22px;
  border-radius: 999px;
  font-size: 13px;
  pointer-events: none;
  white-space: nowrap;
  backdrop-filter: blur(4px);
}
</style>
