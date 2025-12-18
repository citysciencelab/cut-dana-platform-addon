import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDashboardStore = defineStore('dashboard', () => {
  const mode = ref('all');
  const open = ref(true);

  return {
    mode,
    open,
  };
});
