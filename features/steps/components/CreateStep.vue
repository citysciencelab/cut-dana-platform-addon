<script setup>

import ToolWindow from '../../shared/Toolwindow/ToolWindow.vue';

import StepForm from './StepForm.vue';


</script>

<template>
  <ToolWindow>
    <template #default>
      <StepForm />
    </template>
  </ToolWindow>
</template>

<style scoped lang="scss">
.actions-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: .2rem;
}
</style>
