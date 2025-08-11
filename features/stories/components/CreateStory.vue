<script setup>
import StoryForm from "./__new/StoryForm.vue";
import ToolWindow from "../../shared/Toolwindow/ToolWindow.vue";
</script>

<template>
    <ToolWindow>
        <template #fixed>
            <StoryForm />
        </template>
    </ToolWindow>
</template>
