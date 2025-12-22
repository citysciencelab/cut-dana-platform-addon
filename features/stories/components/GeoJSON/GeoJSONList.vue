<script setup>
  import { mdiTrashCan, mdiPencil } from '@mdi/js';

  const props = defineProps({
    modelValue: {
      type: Array,
      default: () => ([])
    }
  });

  const emit = defineEmits([ 'editAsset', 'removeAsset' ]);

</script>

<template>
  <v-list
    density="comfortable"
    class="pa-0"
  >
    <v-list-item
      v-for="asset in modelValue"
      :key="asset.id"
      class="pa-0"
    >
      <v-sheet
        width="100%"
        rounded
        class="d-flex align-center px-3 py-2"
        style="border: 1px solid #e1e1e1"
      >
        <span class="flex-grow-1">{{ asset.title }}</span>
        <v-icon
          :icon="mdiTrashCan"
          class="cursor-pointer mr-2"
          @click="emit('removeAsset', asset.id)"
        />
        <v-icon
          :icon="mdiPencil"
          class="cursor-pointer"
          @click="emit('editAsset', asset.id)"
        />
      </v-sheet>
    </v-list-item>
  </v-list>
</template>
