import Radio from "backbone.radio/build/backbone.radio";


/**
 * Function to get the Cesium map
 * @function getCesiumMap
 * @returns {boolean} - Returns true if the map is 3D, false otherwise
 */
export function isMap3D () {
    return Radio.request("Map", "isMap3d");
}


/**
 * Function to get the Cesium map
 * @function cesiumMap
 * @returns {Object} - Returns the 3D map
 */
export function cesiumMap () {
    return Radio.request("Map", "getMap3d");
}

/**
 * Function to get the Cesium scene
 * @function cesiumScene
 * @returns {Object} - Returns the Cesium scene
 */
export function cesiumScene () {
    return Radio.request("Map", "getMap3d").getCesiumScene();
}

/**
 * Function to get the Cesium camera
 * @function cesiumCamera
 * @returns {Object} - Returns the Cesium camera
 */
export function cesiumCamera () {
    return Radio.request("Map", "getMap3d").getCamera().cam_;
}
