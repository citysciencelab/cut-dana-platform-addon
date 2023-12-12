// all functions that mutate the state
import store from "../../../../../src/app-store";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import {ColladaLoader} from "three/examples/jsm/loaders/ColladaLoader.js";
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter.js";
import crs from "@masterportal/masterportalapi/src/crs";


/**
 * Adds EPSG:4326 in decimal-degree to list of projections.
 * @param {Object} state - The state of this component.
 * @param {Object} payload - Params for this function
 * @param {Array} payload.projections list of all available projections
 * @param {Object} payload.elementETRS89_3GK3 the WGS84 projection contained in list of projections
 * @param {Object} payload.epsg8395 the WGS84 projection contained in list of projections
 * @returns {void}
 */
function addETRS893GK3 (state, payload) {
    const {projections, elementETRS89_3GK3, epsg8395} = payload,
        index = projections.findIndex(proj => proj.name === "EPSG:8395"),
        etrs89_3GK3Proj = {};

    for (const key in epsg8395[0]) {
        etrs89_3GK3Proj[key] = epsg8395[0][key];
    }
    etrs89_3GK3Proj.name = "ETRS893GK3";
    etrs89_3GK3Proj.epsg = "EPSG:8395";
    etrs89_3GK3Proj.id = "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3";
    etrs89_3GK3Proj.title = elementETRS89_3GK3[1].substring(elementETRS89_3GK3[1].lastIndexOf("ETRS"), elementETRS89_3GK3[1].indexOf(" +proj="));
    etrs89_3GK3Proj.getCode = () => "noEPSGCode";
    projections.splice(index + 1, 0, etrs89_3GK3Proj);
}

/**
 * Adds EPSG:4326 in decimal-degree to list of projections.
 * @param {Object} state - The state of this component.
 * @param {Object} payload - Params for this function
 * @param {Array} payload.projections list of all available projections
 * @param {Object} payload.wgs84Proj the WGS84 projection contained in list of projections
 * @returns {void}
 */
function addWGS84Decimal (state, payload) {
    const {projections, wgs84Proj} = payload,
        index = projections.findIndex(proj => proj.name === "EPSG:4326"),
        wgs84ProjDez = {};

    for (const key in wgs84Proj[0]) {
        wgs84ProjDez[key] = wgs84Proj[0][key];
    }
    wgs84ProjDez.name = "EPSG:4326-DG";
    wgs84ProjDez.epsg = "EPSG:4326";
    wgs84ProjDez.id = "http://www.opengis.net/gml/srs/epsg.xml#4326-DG";
    wgs84ProjDez.title = "WGS84_Lat-Lon (Grad, Dezimal), EPSG 4326";
    wgs84ProjDez.getCode = () => "EPSG:4326-DG";
    projections.splice(index + 1, 0, wgs84ProjDez);
}

/**
 * Initializes the projections to select. If projection EPSG:4326 is available same is added in decimal-degree.
 * @param {Object} state - The state of this component.
 * @returns {void}
 */
function initProjections (state) {
    const namedProjections = store.state.namedProjections,
        pr = crs.getProjections(),
        epsg8395 = [],
        wgs84Proj = [];

    if (this.projections.length) {
        return;
    }
    // id is set to the name and in case of decimal "-DG" is appended to name later on
    // for use in select-box
    pr.forEach(proj => {
        proj.id = proj.name;
        if (proj.name === "EPSG:4326" || proj.name === "http://www.opengis.net/gml/srs/epsg.xml#4326") {
            wgs84Proj.push(proj);
        }
        if (proj.name === "EPSG:8395" || proj.name === "http://www.opengis.net/gml/srs/epsg.xml#8395") {
            epsg8395.push(proj);
        }
        if (proj.name.indexOf("#") > -1) { // e.g. "http://www.opengis.net/gml/srs/epsg.xml#25832"
            const code = proj.name.substring(proj.name.indexOf("#") + 1, proj.name.length);

            proj.epsg = "EPSG:" + code;
        }
        else {
            proj.title = proj.name;
        }
        if (proj.id === state.currentProjection.id) {
            state.currentProjection = proj;
        }
    });
    if (wgs84Proj.length > 0) {
        addWGS84Decimal(state, {pr, wgs84Proj});
    }
    namedProjections.find((el) => {
        if (el[1].includes("ETRS89_3GK3") && epsg8395.length > 0) {
            addETRS893GK3(state, {pr, el, epsg8395});
            return true;
        }
        return false;
    });
    state.projections = pr;
}

/**
 * Adds and processes the selected file.
 * @param {FileList} state - The selected files.
 * @param {number} payload - The ID of the selected file.
 * @param {FileList} payload.files - The selected files.
 * @param {number} payload.fileId - The ID of the selected file.
 * @returns {void}
 */
function importFile (state, payload) {
    // this.checkMapCollection(fileId);

    const {files, fileId} = payload,
        reader = new FileReader(),
        file = files[0],
        fileName = file.name.split(".")[0],
        fileExtension = file.name.split(".").pop(),
        fileSizeMB = file.size / (1024 * 1024),
        maxFileSizeMB = 100;

    if (fileSizeMB > maxFileSizeMB) {
        store.dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.modeler3D.import.alertingMessages.fileSizeError"), {root: true});
        return;
    }


    if (fileExtension === "gltf") {
        handleGltfFile(state, {file, fileName, fileId});
        return;
    }

    state.loading = true;

    reader.onload = (event) => {
        if (fileExtension === "obj") {
            this.handleObjFile(event.target.result, fileName, fileId);
        }
        else if (fileExtension === "dae") {
            this.handleDaeFile(event.target.result, fileName, fileId);
        }
        // else if (fileExtension === "geojson") {
        //     this.handleGeoJsonFile(event.target.result, fileId);
        // }
        // else {
        //     store.dispatch("Alerting/addSingleAlert", {content: i18next.t("common:modules.tools.modeler3D.import.alertingMessages.missingFormat", {format: fileExtension})}, {root: true});
        //     state.loading = false;
        //     // this.setIsLoading(false);
        // }
    };

    reader.onerror = (e) => {
        console.error("Error reading the file:", e.target.error);
        state.loading = false;
    };

    if (fileExtension === "dae") {
        reader.readAsDataURL(file);
    }
    else if (fileExtension === "png" || fileExtension === "jpg" || fileExtension === "jpeg") {
        reader.readAsDataURL(file);
    }
    else {
        reader.readAsText(file);
    }
}

/**
 * Handles the processing of GLTF content.
 * @param {Object} state - The state of this component.
 * @param {Object} payload - The payload of the action.
 * @param {Blob} payload.file - The GLTF content.
 * @param {String} payload.fileName - The name of the file.
 * @param {number} payload.fileId - The ID of the selected file.
 * @returns {void}
 */
function handleGltfFile (state, payload) {
    // this.checkMapCollection(fileId);

    const {file, fileName, fileId} = payload,
        viewer = mapCollection.getMap("3D"),
        currentLocation = viewer.camera_.cam_.position,

        entity = createEntity(state, {
            viewer,
            entityId: fileId,
            name: fileName,
            scale: 1,
            orientation: undefined,
            visibility: true,
            uri: URL.createObjectURL(file),
            clampToGround: true,
            position: currentLocation
        });

    console.log(currentLocation);


    state.selectedEntityId = entity.id;
    // this.moveEntity(undefined, fileId);
    // this.writeEntityDataToItems(entity, fileId);

    // entities.add(entity);

    // models.push({
    //     id: entity.id,
    //     name: fileName,
    //     show: true,
    //     edit: false,
    //     heading: 0
    // });


    // state.importedEntities = models;
    state.loading = false;
}

/**
 * Handles the processing of OBJ content.
 * @param {Object} state - The state of this component.
 * @param {Object} payload - The payload of the action.
 * @param {String} payload.content - The OBJ content.
 * @param {String} payload.fileName - The name of the file.
 * @param {number} payload.fileId - The ID of the selected file.
 * @returns {void}
 */
function handleObjFile (state, payload) {
    const {content, fileName, fileId} = payload,
        objLoader = new OBJLoader(),
        objData = objLoader.parse(content),
        gltfExporter = new GLTFExporter();

    gltfExporter.parse(objData, (gltfData) => {
        const gltfJson = JSON.stringify(gltfData),
            blob = new Blob([gltfJson], {type: "model/gltf+json"});

        handleGltfFile(state, {file: blob, fileName, fileId});
    });
}

/**
 * Handles the processing of a DAE file.
 * @param {Object} state - The state of this component.
 * @param {Object} payload - The payload of the action.
 * @param {String} payload.content - The OBJ content.
 * @param {String} payload.fileName - The name of the file.
 * @param {number} payload.fileId - The ID of the selected file.
 * @returns {void}
 */
function handleDaeFile (state, payload) {
    const {content, fileName, fileId} = payload,
        colladaLoader = new ColladaLoader();

    colladaLoader.load(content, (collada) => {
        const exporter = new GLTFExporter();

        exporter.parse(collada.scene, (gltfData) => {
            const gltfLoader = new GLTFLoader();

            gltfLoader.parse(gltfData, "", () => {
                const gltfJson = JSON.stringify(gltfData),
                    blob = new Blob([gltfJson], {type: "model/gltf+json"});

                handleGltfFile(state, {file: blob, fileName, fileId});
            });
        });
    });
}


// /**
//  * Handles the processing of GeoJSON content.
//  * @param {Object} state - The state of this component.
//  * @param {Object} payload - The payload of the action.
//  * @param {String} payload.content - The GeoJSON content.
//  * @param {String} payload.fileName - The name of the file.
//  * @param {number} payload.fileId - The ID of the selected file.
//  * @returns {void}
//  */
// function handleGeoJsonFile (state, payload) {

//     const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
//         {content, fileName, fileId} = payload,
//         geojson = JSON.parse(content);

//     geojson.features.forEach(feature => {
//         const properties = feature.properties,
//             color = properties.color,
//             outlineColor = properties.outlineColor,
//             coordinates = feature.geometry.coordinates[0],
//             lastElement = entities.values.slice().pop(),
//             lastId = lastElement?.id,
//             entity = new Cesium.Entity({
//                 id: lastId ? lastId + 1 : 1,
//                 name: properties.name,
//                 wasDrawn: true,
//                 clampToGround: properties.clampToGround
//             });

//         if (feature.geometry.type === "Polygon") {
//             entity.polygon = {
//                 material: new Cesium.ColorMaterialProperty(
//                     new Cesium.Color(color.red, color.green, color.blue, color.alpha)
//                 ),
//                 outline: true,
//                 outlineColor: new Cesium.Color(outlineColor.red, outlineColor.green, outlineColor.blue, outlineColor.alpha),
//                 outlineWidth: 1,
//                 height: coordinates[0][2],
//                 extrudedHeight: properties.extrudedHeight,
//                 shadows: Cesium.ShadowMode.ENABLED,
//                 hierarchy: new Cesium.PolygonHierarchy(coordinates.map(point => Cesium.Cartesian3.fromDegrees(point[0], point[1])))
//             };
//         }
//         else if (feature.geometry.type === "Polyline") {
//             entity.polyline = {
//                 material: new Cesium.ColorMaterialProperty(
//                     new Cesium.Color(color.red, color.green, color.blue, color.alpha)
//                 ),
//                 width: properties.width,
//                 positions: coordinates.map(point => Cesium.Cartesian3.fromDegrees(point[0], point[1], point[2]))
//             };
//         }


//         entities.add(entity);
//         // this.drawnModels.push({
//         //     id: entity.id,
//         //     name: entity.name,
//         //     show: true,
//         //     edit: false
//         // });
//     });

//     // this.setCurrentView("draw");
//     // this.setIsLoading(false);
// }


/**
 * Removes an entity from the viewer.
 * @param {Object} state state of the datanarrator module
 * @param {Object} payload payload of the action
 * @param {*} payload.viewer the cesium viewer
 * @param {*} payload.entityId the entity id
 * @returns {void}
 */
function removeEntity (state, payload) {
    const {viewer, entityId} = payload,
        entity = viewer.entities.getById(entityId);

    if (entity) {
        viewer.entities.remove(entity);
    }
}

/**
 * Toggles the visibility of an entity.
 * @param {Object} state state of the datanarrator module
 * @param {Object} payload payload of the action
 * @param {*} payload.viewer the cesium viewer
 * @param {*} payload.entityId the entity id
 * @returns {void}
 */
function toggleEntityVisibility (state, payload) {
    const {viewer, entityId} = payload,
        entity = viewer.entities.getById(entityId);

    if (entity) {
        entity.show = !entity.show;
    }
}

/**
 * Enables the visibility of an entity.
 * @param {Object} state state of the datanarrator module
 * @param {Object} payload payload of the action
 * @param {*} payload.viewer the cesium viewer
 * @param {*} payload.entityId the entity id
 * @returns {void}
 */
function enableEntityVisibility (state, payload) {
    const {viewer, entityId} = payload,
        entity = viewer.entities.getById(entityId);

    if (entity) {
        entity.show = true;
    }
}


/**
 * Disables the visibility of an entity.
 * @param {Object} state state of the datanarrator module
 * @param {Object} payload payload of the action
 * @param {*} payload.viewer the cesium viewer
 * @param {*} payload.entityId the entity id
 * @returns {void}
 */
function disableEntityVisibility (state, payload) {
    const {viewer, entityId} = payload,
        entity = viewer.entities.getById(entityId);

    if (entity) {
        entity.show = false;
    }
}

/**
 * Disables the visibility of all entities.
 * @param {Object} state state of the datanarrator module
 * @param {Object} payload payload of the action
 * @param {*} payload.viewer the cesium viewer
 * @returns {void}
 */
function disableAllEntities () {
    const viewer = mapCollection.getMap("3D"),
        entities = viewer.getDataSourceDisplay().defaultDataSource.entities;

    entities.values.forEach(entity => {
        entity.show = false;
    });
}

/**
 * Changes the location of an entity.
 * @param {Object} state state of the datanarrator module
 * @param {Object} payload payload of the action
 * @param {*} payload.entityId the entity id
 * @param {*} payload.newLocation the new location
 * @returns {void}
 */
function changeEntityLocation (state, payload) {
    const {entityId} = payload,
        viewer = mapCollection.getMap("3D"),
        entities = viewer.getDataSourceDisplay().defaultDataSource.entities,
        entity = entities.getById(entityId);

    console.log(payload.newLocation, "POSITION:", entity.position, "enitityID:", payload.entityId);

    if (entity && entity.position) {
        entity.position = payload.newLocation;
    }
}

/**
 * Scales an entity.
 * @param {Object} state state of the datanarrator module
 * @param {Object} payload payload of the action
 * @param {*} payload.entityId the entity id
 * @param {*} payload.scale the new scale factor
 * @returns {void}
 */
function scaleEntity (state, payload) {

    const {entityId, scale} = payload,
        viewer = mapCollection.getMap("3D"),
        entities = viewer.getDataSourceDisplay().defaultDataSource.entities,
        entity = entities.getById(entityId);

    if (entity && entity.model) {
        entity.model.scale = scale;
    }
}

/**
 * Creates and adds an entity to the viewer and state.
 * @param {Object} state state of the datanarrator module
 * @param {Object} payload payload of the action
 * @param {string} payload.entityId the entity id
 * @param {number} payload.scale the scale factor
 * @param {object} payload.orientation the orientation
 * @param {boolean} payload.visibility the visibility
 * @param {string} payload.uri the uri of the model
 * @param {object} payload.position the position of the model
 * @param {boolean} payload.clampToGround if the model should be clamped to the ground
 * @returns {Object} the created entity
 */
function createEntity (state, payload) {
    const {entityId, scale, orientation, visibility, uri, position} = payload,
        viewer = mapCollection.getMap("3D"),
        entities = viewer.getDataSourceDisplay().defaultDataSource.entities;
        // check if entity already exists, if it does, just replace all the values in the entity and set it to visible

    // entity = entities.add({
    //     id: entityId,
    //     model: {
    //         uri: uri, // replace with your model path
    //         scale: scale
    //     },
    //     clampToGround: payload.clampToGround,
    //     // orientation: orientation,
    //     show: visibility,
    //     position: position
    // });

    let entity = entities.getById(entityId);

    if (entity) {
        entity.model.uri = uri;
        entity.model.scale = scale;
        entity.clampToGround = payload.clampToGround;
        entity.show = true;
        entity.position = position;
        return entity;
    }
    entity = entities.add({
        id: entityId,
        model: {
            uri: uri, // replace with your model path
            scale: scale
        },
        clampToGround: payload.clampToGround,
        // orientation: orientation,
        show: visibility,
        position: position
    });


    // entities.add(entity);

    // Add the entity to the state
    state.importedEntities.push(entity);
    return entity;
}


export default {
    importFile,
    removeEntity,
    toggleEntityVisibility,
    changeEntityLocation,
    scaleEntity,
    createEntity,
    disableEntityVisibility,
    disableAllEntities,
    enableEntityVisibility
};
