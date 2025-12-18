<script setup>
import { useTranslation } from 'i18next-vue';
import { useStore } from 'vuex';

const store = useStore();

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
  store.commit('Modules/DataNarrator/DashboardStore/setMode', mode);
  store.dispatch('Modules/DataNarrator/StoryStore/fetchStories', mode);
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

