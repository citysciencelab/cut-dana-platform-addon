import {mapGetters} from "vuex";

/**
 * Function to get the Cesium map
 * @function getCesiumMap
 * @returns {boolean} - Returns true if the map is 3D, false otherwise
 */
export function isMap3D () {
    // TODO: Is map 3D getter?
    // import {mapActions, mapGetters, mapMutations} from "vuex";
    // ...mapGetters("Maps", ["mode"]),
    // this.mode === "2D"
    // return Radio.request("Map", "isMap3d");
}


/**
 * Function to get the Cesium map
 * @function cesiumMap
 * @returns {Object} - Returns the 3D map
 */
export function cesiumMap () {
    return mapCollection.getMap("3D");
}

/**
 * Function to get the Cesium scene
 * @function cesiumScene
 * @returns {Object} - Returns the Cesium scene
 */
export function cesiumScene () {
    return mapCollection.getMap("3D").getCesiumScene();
}

/**
 * Function to get the Cesium camera
 * @function cesiumCamera
 * @returns {Object} - Returns the Cesium camera
 */
export function cesiumCamera () {
    return mapCollection.getMap("3D").getCesiumScene().camera;
}
