<script setup>

import StepForm from "./StepForm.vue";

import ToolWindow from "../../shared/Toolwindow/ToolWindow.vue";

</script>

<template>

    <ToolWindow>
        <template v-slot:header>
            <div>header</div>
        </template>
        <template v-slot:default>
            <div id="tool-dataNarrator-creator-stepForm">
                <StepForm />
            </div>
        </template>
        <template v-slot:footer>
            <div class="actions-container" />
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
