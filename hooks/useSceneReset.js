import { useStore } from 'vuex';

import { clearGeoJSON } from '../utils/geoJSON';

import { useNavigation } from './useNavigation';

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

  let isResetting = false;

  function resetScene() {
    if (isResetting) return;
    isResetting = true;

    try {
      let scene = null;

      try {
        const map3d = mapCollection?.getMap('3D');
        scene = map3d?.getCesiumScene();
      } catch {
        // 3D map may not be available
      }

      if (scene) {
        try {
          scene.camera.setView({
            destination: scene.camera.position,
            orientation: {
              heading: 0,
              pitch: scene.camera.pitch,
              roll: scene.camera.roll,
            },
          });
        } catch {
          // Camera reset may fail if scene is being destroyed
        }
      }

      // Remove all 3D entities
      const importedModels = store.getters['Modules/Modeler3D/importedModels'] ?? [];

      for (const model of [ ...importedModels ]) {
        try {
          store.dispatch('Modules/Modeler3D/deleteEntity', model.id);
        } catch {
          // Entity may already be removed
        }
      }

      // Switch to 2D
      store.dispatch('Maps/changeMapMode', '2D');

      // Reset layers and GeoJSON
      removeAllVisibleLayers();
      clearGeoJSON();
    } finally {
      isResetting = false;
    }
  }

  return { resetScene };
}
