<script setup>
import DashboardHeader from "./DashboardHeader.vue";
import DashboardContent from "./DashboardContent.vue";
import ToolWindow from "../../shared/Toolwindow/ToolWindow.vue";
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
