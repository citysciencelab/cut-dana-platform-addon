import {computed, ref} from "vue";
import {useStore} from "vuex";

export function useNavigation () {
    const store = useStore();

    const zoom = computed(() => store.state.Maps.zoom);
    const center = computed(() => store.state.Maps.center);

    const initialZoom   = ref(store.state.Maps.zoom);
    const initialCenter = ref(store.state.Maps.center);

    const setView = ({ center, zoom }) => {
        store.commit('Maps/setView', {
            center,
            zoom,
        });
    }

    const setBaseLayer = (layerId) => {
        if (!layerId) return;
        store.dispatch('Modules/BaselayerSwitcher/updateLayerVisibilityAndZIndex', layerId);
    };

    return {
        initialZoom,
        initialCenter,
        zoom,
        center,
        setView,
        defaultBaseLayerId: "453",
        setBaseLayer
    }
}
