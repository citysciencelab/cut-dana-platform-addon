<script setup>

import StepForm from "./StepForm.vue";

import ToolWindow from "../../shared/Toolwindow/ToolWindow.vue";

</script>

<template>
    <ToolWindow>
        <template v-slot:default>
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
