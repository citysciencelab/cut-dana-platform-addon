import { computed, ref } from 'vue';
import { useStore } from 'vuex';

export function useNavigation () {
    const store = useStore();

    const zoom = computed(() => store.state.Maps.zoom);
    const center = computed(() => store.state.Maps.center);

    const initialZoom = ref(store.state.Maps.zoom);
    const initialCenter = ref(store.state.Maps.center);

    const canZoomIn  = computed(() => !store.getters['Maps/isMaxZoomDisplayed']);
    const canZoomOut = computed(() => !store.getters['Maps/isMinZoomDisplayed']);

    const zoomIn  = () => store.dispatch('Maps/increaseZoom');
    const zoomOut = () => store.dispatch('Maps/decreaseZoom');

    const setView = ({ center, zoom }) => {
        store.commit('Maps/setView', {
            center,
            zoom
        });
    }

    const setAnimatedView = ({ center, zoom }) => {
        store.commit('Maps/animateView', {
            center,
            zoom
        });
    }

    const setBaseLayer = (layerId) => {
        if (!layerId) {
            return
        }

        store.dispatch('Modules/BaselayerSwitcher/updateLayerVisibilityAndZIndex', layerId);
    };

    return {
        initialZoom,
        initialCenter,
        zoom,
        center,
        setView,
        setAnimatedView,
        zoomIn,
        zoomOut,
        canZoomIn,
        canZoomOut,
        defaultBaseLayerId: '19969',
        setBaseLayer
    }
}
