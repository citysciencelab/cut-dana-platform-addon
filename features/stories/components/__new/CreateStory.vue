<script setup>
import StoryForm from "./StoryForm.vue";
import ToolWindow from "../../../shared/Toolwindow/ToolWindow.vue";
</script>

<template>
    <ToolWindow>
        <template #fixed>
            <StoryForm />
        </template>
    </ToolWindow>
</template>
