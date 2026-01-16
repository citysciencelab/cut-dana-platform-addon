import { computed, ref } from 'vue';
import { useStore } from 'vuex';

export function useNavigation() {
  const store = useStore();

  const zoom = computed(() => store.state.Maps.zoom);
  const center = computed(() => store.state.Maps.center);

  const initialZoom = ref(store.state.Maps.zoom);
  const initialCenter = ref(store.state.Maps.center);

  const canZoomIn = computed(() => !store.getters['Maps/isMaxZoomDisplayed']);
  const canZoomOut = computed(() => !store.getters['Maps/isMinZoomDisplayed']);

  const zoomIn = () => store.dispatch('Maps/increaseZoom');
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

  const setInformationLayers = (layers = [], removableBlackList = [ '19969' ]) => {
    const layerIds = layers.map(({ id, transparency }) => id);
    const prev = store.getters.visibleLayerConfigs.map(config => config.id) || [];

    const added = layerIds.filter(id => !prev.includes(id));
    const removed = prev.filter(id => !layerIds.includes(id));

    for (const id of added) {
      store.dispatch('addOrReplaceLayer', {
        layerId: id,
        isBaseLayer: false,
        transparency: layers.find(item => item.id === id)?.transparency
      });
    }

    for (const id of removed) {
      if (removableBlackList.includes(id)) {
        continue;
      }
      store.dispatch('Modules/LayerTree/removeLayer', { id });
    }
  }

  const removeAllVisibleLayers = (restoreDefaultBaseLayer = true) => {
    for (const layerConfig of store.getters.visibleLayerConfigs) {
      const id = layerConfig.id;
      store.dispatch('Modules/LayerTree/removeLayer', { id });
    }

    if (restoreDefaultBaseLayer) {
      setBaseLayer('19969');
    }
  }

  return {
    canZoomIn,
    canZoomOut,
    center,
    removeAllVisibleLayers,
    defaultBaseLayerId: '19969',
    initialCenter,
    initialZoom,
    setAnimatedView,
    setBaseLayer,
    setInformationLayers,
    setView,
    zoom,
    zoomIn,
    zoomOut,
  }
}
