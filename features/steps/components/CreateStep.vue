<script setup>

import StepForm from "./StepForm.vue";
import Toolwindow from "../../shared/Toolwindow/ToolWindow.vue";
</script>

<template>
    <Toolwindow>
        <template #header>
            <div>header</div>
        </template>
        <template #default>
            <div id="tool-dataNarrator-creator-stepForm">
                <StepForm />
            </div>
        </template>
        <template #footer>
            <div class="actions-container" />
        </template>
    </Toolwindow>
</template>

<style scoped lang="scss">
.actions-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: .2rem;
}
</style>
