import { useStore } from 'vuex';

import { clearGeoJSON } from '../utils/geoJSON';
import { useNavigation } from '../features/steps/hooks/useNavigation';

/**
 * Provides a unified reset function that cleans up all map/scene state:
 * - Removes all 3D entities from Modeler3D
 * - Resets the Cesium camera heading to north
 * - Switches back to 2D map mode
 * - Removes all visible layers and restores the default base layer
 * - Clears all GeoJSON overlays
 */
export function useSceneReset() {
  const store = useStore();
  const { removeAllVisibleLayers } = useNavigation();

  function resetScene() {
    const map3d = mapCollection.getMap('3D');
    const scene = map3d?.getCesiumScene();

    if (scene) {
      // Reset heading to north
      scene.camera.setView({
        destination: scene.camera.position,
        orientation: {
          heading: 0,
          pitch: scene.camera.pitch,
          roll: scene.camera.roll,
        },
      });
    }

    // Remove all 3D entities
    const importedModels = store.getters['Modules/Modeler3D/importedModels'] ?? [];

    for (const model of [...importedModels]) {
      store.dispatch('Modules/Modeler3D/deleteEntity', model.id);
    }

    // Switch to 2D
    store.dispatch('Maps/changeMapMode', '2D');

    // Reset layers and GeoJSON
    removeAllVisibleLayers();
    clearGeoJSON();
  }

  return { resetScene };
}
