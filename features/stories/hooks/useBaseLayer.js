import { computed } from 'vue';
import { useStore } from 'vuex';

export function useBaseLayer () {
    const store = useStore();

    const layers = computed(() => store.state.layerConfig.baselayer.elements ?? []);

    const items = computed(() =>
        layers.value.map(layer => ({
            title: layer.name,
            value: layer.id,
        }))
    );

    return {
        items
    };
}
