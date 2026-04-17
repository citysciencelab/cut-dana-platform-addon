<script setup>
import { mdiArrowLeft } from '@mdi/js';

import { useTranslation } from 'i18next-vue';

import { useDataNarrator } from '../../../../hooks/useDataNarrator';
import { ToolwindowModes } from '../../../../store/contantsDataNarrator';

const { toolwindowMode } = useDataNarrator();
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  isPreview: {
    type: Boolean,
    default: false
  },
  showHeader: {
    type: Boolean,
    default: true
  }
});
const emit = defineEmits([ 'leave-preview', 'back' ]);
const { t } = useTranslation();

function handleBack() {
  if (props.isPreview) {
    emit('leave-preview');
    return;
  }

  emit('back');
}
</script>

<template>
  <div class="player-frame-wrapper">
    <div :class="{ 'player-frame': true, mobile: toolwindowMode === ToolwindowModes.MOBILE }">
      <v-toolbar
        v-if="showHeader"
        color="transparent"
        size="compact"
        class="sticky-top"
        style="border-radius: 100px;padding: 0;"
      >
        <template #prepend>
          <template v-if="isPreview">
            <v-btn
              :prepend-icon="mdiArrowLeft"
              size="compact"
              variant="text"
              style="gap: 5px"
              @click="emit('leave-preview')"
            >
              {{ t('additional:modules.dataNarrator.button.leavePreview') }}
            </v-btn>
          </template>
          <template v-else>
            <v-tooltip location="top">
              <template #activator="{ props: actv }">
                <v-btn
                  :icon="mdiArrowLeft"
                  size="compact"
                  class="mr-2"
                  v-bind="actv"
                  @click="handleBack"
                />
              </template>
              <span>{{ t('additional:modules.dataNarrator.label.backToDashboard') }}</span>
            </v-tooltip>

            <div class="bold">
              {{ props.title }}
            </div>
          </template>
        </template>
      </v-toolbar>

      <div class="player-content pt-2 pb-2">
        <slot name="default" />
      </div>
    </div>

    <div class="player-nav-bar">
      <slot name="footer" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.player-frame-wrapper {
  position: absolute;
  top: 90px;
  bottom: 40px;
  left: 20px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.player-frame {
  flex: 1;
  min-height: 0;
  background-color: white;
  box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.30);
  border-radius: .8rem;
  padding: 0 10px;
  display: flex;
  flex-direction: column;

  &.mobile {
    background-color: transparent;
    box-shadow: none;
  }
}

.player-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.player-nav-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px 0;
}
</style>
