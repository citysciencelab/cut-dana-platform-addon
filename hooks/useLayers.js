import {computed, onMounted} from "vue";
import {useStore} from "vuex";

export function useLayers(opts = {}) {
    const {autoFetch = true, url} = opts;
    const store = useStore();
    const ns = "Modules/DataNarrator/LayersStore";

    const layersTree = computed(() => store.getters[`${ns}/layersTree`]);
    const loading = computed(() => store.getters[`${ns}/loading`]);
    const error = computed(() => store.getters[`${ns}/error`]);

    const idToLayerMap = computed(() => {
        const map = new Map();
        for (const cat of layersTree.value ?? []) {
            for (const sub of cat.subcategories ?? []) {
                for (const layer of sub.layers ?? []) {
                    if (layer?.id) map.set(String(layer.id), layer);
                }
            }
        }
        return map;
    });

    const fetchNow = (customUrl) =>
        store.dispatch(`${ns}/fetchAndSortServices`, customUrl ? {url: customUrl} : undefined);

    onMounted(() => {
        if (!autoFetch) return;
        const hasData = Array.isArray(layersTree.value) && layersTree.value.length > 0;
        if (!hasData && !loading.value) {
            fetchNow(url);
        }
    });

    return {layersTree, loading, error, fetchNow, idToLayerMap};
}
