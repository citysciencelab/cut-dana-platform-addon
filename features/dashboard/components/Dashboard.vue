<script setup>
import { onMounted } from 'vue';
import { useStore } from 'vuex';

import ToolWindow from '../../shared/Toolwindow/ToolWindow.vue';

import DashboardContent from './DashboardContent.vue';
import DashboardHeader from './DashboardHeader.vue';

const store = useStore();

onMounted(() => {
  store.dispatch('Modules/DataNarrator/StoryStore/fetchStories', 'all');
})
</script>

<template>
  <ToolWindow>
    <template #header>
      <DashboardHeader />
    </template>
    <template #default>
      <div id="tool-dataNarrator-creator-stepForm">
        <DashboardContent />
      </div>
    </template>
  </ToolWindow>
</template>

<style>
</style>
