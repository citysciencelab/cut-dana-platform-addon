<template>
    <ToolWindow>
        <template #header>
            <DashboardHeader />
        </template>
        <template #default>
            <DashboardContent />
        </template>
        <template #footer>
            <div>test</div>
        </template>
    </ToolWindow>
</template>

<script setup>


import ToolWindow from "../../shared/Toolwindow/ToolWindow.vue";
import DashboardHeader from "./DashboardHeader.vue";
import DashboardContent from "./DashboardContent.vue";
</script>

<style scoped>

</style>
