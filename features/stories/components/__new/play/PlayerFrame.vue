<script setup>
import { mdiArrowLeft, mdiDotsVertical } from '@mdi/js';

import { useDataNarrator } from '../../../../../hooks/useDataNarrator';
import { dataNarratorModes, ToolwindowModes } from '../../../../../store/contantsDataNarrator';
import { useTranslation } from 'i18next-vue';

const { gotoPage } = useDataNarrator();
const { toolwindowMode } = useDataNarrator();
const props = defineProps({
   title: String
});
const { t } = useTranslation();

function backToDashboard() {
    gotoPage(dataNarratorModes.DASHBOARD);

    const baseUrl = `${location.origin}/portal/stories`;
    window.history.replaceState({}, '', baseUrl);
}
</script>

<template>
  <div :class="{ 'player-frame': true, mobile: toolwindowMode === ToolwindowModes.MOBILE }">
    <v-toolbar
      color="transparent"
      size="compact"
      class="sticky-top"
      style="border-radius: 100px;padding: 0;"
    >
      <template #prepend>
        <v-tooltip location="top">
          <template #activator="{ props: actv }">
            <v-btn
              :icon="mdiArrowLeft"
              size="compact"
              class="mr-2"
              @click="backToDashboard"
              v-bind="actv"
            />
          </template>
          <span>{{ t('additional:modules.dataNarrator.label.backToDashboard') }}</span>
        </v-tooltip>

        <div class="bold">
          {{ props.title }}
        </div>
      </template>

      <v-btn
        :icon="mdiDotsVertical"
        size="compact"
      />
    </v-toolbar>

    <div class="player-content">
      <slot name="default" />
    </div>

    <div class="player-footer mb-2 px-2">
      <slot name="footer" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.player-frame {
    position: absolute;
    top: 90px;
    bottom: 90px;
    left: 20px;
    right: 0;
    background-color: #f6f6f6;
    box-shadow: 0 12px 30px -8px rgba(0,0,0,0.30);
    border-radius: .8rem;
    padding: 0 10px;
    display: flex;
    flex-direction: column;

    &.mobile {
        background-color: transparent;
        box-shadow: none;
        top: 30px;
        bottom: 10px;
        right: 10px;
        left: 10px;
    }
}

.player-content {
    height: 100%;
    overflow-y: auto;
}

.player-footer {
    margin-top: auto;
}
</style>
