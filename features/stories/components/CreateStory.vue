<script setup>
import ToolWindow from '../../shared/Toolwindow/ToolWindow.vue';

import StoryForm from './StoryForm.vue';
</script>

<template>
  <ToolWindow>
    <template #fixed>
      <StoryForm />
    </template>
  </ToolWindow>
</template>
