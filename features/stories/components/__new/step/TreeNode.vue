<script setup>
defineOptions({ name: "TreeNode" });

import { mdiPlus } from "@mdi/js";

const props = defineProps({
    node: { type: Object, required: true },
    selectedIds: { type: Array, default: () => [] },
    baseLayerIds: { type: Object, default: () => new Set() }
});
const emit = defineEmits(["add"]);
</script>

<template>
    <v-list-group v-if="node.isFolder" no-action>
        <template #activator="{ props: act }">
            <v-list-item v-bind="act" :title="node.name" />
        </template>

        <TreeNode
            v-for="child in node.children"
            :key="child.id"
            :node="child"
            :selected-ids="selectedIds"
            :base-layer-ids="baseLayerIds"
            @add="emit('add', $event)"
        />
    </v-list-group>

    <v-list-item
        v-else
        :title="node.name"
        :disabled="baseLayerIds.has(String(node.id)) || selectedIds.includes(node.id)"
    >
        <template #append>
            <v-btn
                size="small"
                variant="text"
                :prepend-icon="mdiPlus"
                :disabled="selectedIds.includes(node.id)"
                @click="emit('add', node.id)"
            >
                Add layer
            </v-btn>
        </template>
    </v-list-item>
</template>
