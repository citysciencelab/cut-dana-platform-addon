<script setup>

import { useTranslation } from 'i18next-vue';

import { storeToRefs } from 'pinia';

import { useDashboard } from '../../hooks/useDashboard';
import { useDashboardStore } from '../../store/useDashboardStore';

const dashboardStore = useDashboardStore();
const { mode:storiesDisplayMode } = storeToRefs(dashboardStore)
const { refetch } = useDashboard();

const { t } = useTranslation();

const { mode, active } = defineProps({
  mode: {
    type: String,
    default: 'all'
  },
  active: {
    type: Boolean,
    default: false
  }
});

const setMode = () => {
  console.log('setMode', mode);
  storiesDisplayMode.value = mode;
};
</script>

<template>
  <v-btn
    rounded
    size="x-small"
    elevation="0"
    variant="text"
    :color="active ? 'info' : ''"
    @click="setMode"
  >
    {{ t(`additional:modules.dataNarrator.storyList.${mode}`) }}
  </v-btn>
</template>

