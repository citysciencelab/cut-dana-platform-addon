import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';

export function use3DLayers() {
  const store = useStore();
  const ns = 'Modules/DataNarrator/LayersStore';

  const layers3D = computed(() => store.getters[`${ns}/layers3D`] ?? []);
  const loading = computed(() => store.getters[`${ns}/loading`]);

  onMounted(() => {
    const hasData = Array.isArray(layers3D.value) && layers3D.value.length > 0;
    if (!hasData && !loading.value) {
      store.dispatch(`${ns}/fetchAndSortServices`);
    }
  });

  return { layers3D, loading };
}
