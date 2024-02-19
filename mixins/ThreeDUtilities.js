import Radio from "backbone.radio/build/backbone.radio";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import {ColladaLoader} from "three/examples/jsm/loaders/ColladaLoader.js";
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter.js";
import crs from "@masterportal/masterportalapi/src/crs";

export default {

    computed: {
        // Computed property to get the value from Vuex store
        is3D () {
            return Radio.request("Map", "isMap3d");
        },

        cesiumMap () {
            return Radio.request("Map", "getMap3d");
        },

        cesiumScene () {
            return Radio.request("Map", "getMap3d").getCesiumScene();
        },

        cesiumCamera () {
            return Radio.request("Map", "getMap3d").getCamera().cam_;

        }
    },
    methods: {

        /**
         * Enables the 3d mode
         * @returns {void}
         */
        async enable3D () {

            // Ensure the current mode is set to 2D before switching to 3D.
            this.$store.commit("Maps/setMode", "2D");
            Radio.trigger("Map", "mapChangeTo3d");

            /**
             * Get the 3d map
             * It avoids direct reassignment of map3D in a way that could cause race conditions.
             * @returns {Object} the 3dmap object
             */
            function getMap3D () {
                return Radio.request("Map", "getMap3d");
            }


            return new Promise((resolve) => {
                let counter = 0;
                const intervalId = setInterval(() => {
                    const map3D = getMap3D();

                    if (map3D) {
                        clearInterval(intervalId);
                        resolve(map3D);
                    }
                    counter = counter + 1;
                }, 100); // Check every  100ms, adjust as needed
            });
        },

        /**
         * Disables the 3d mode
         * @returns {void}
         */
        async disable3D () {
            // makes sure the current mode is in 3D so that it properly and reliably changes to 2d
            await this.$store.commit("Maps/setMode", "3D");
            await Radio.trigger("Map", "mapChangeTo3d");
        },


        /**
         * Adds EPSG:4326 in decimal-degree to list of projections.
         * @param {Object} payload - Params for this function
         * @param {Array} payload.projections list of all available projections
         * @param {Object} payload.elementETRS89_3GK3 the WGS84 projection contained in list of projections
         * @param {Object} payload.epsg8395 the WGS84 projection contained in list of projections
         * @returns {void}
         */
        addETRS893GK3 (payload) {
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
        },

        /**
         * Adds EPSG:4326 in decimal-degree to list of projections.
         * @param {Object} payload - Params for this function
         * @param {Array} payload.projections list of all available projections
         * @param {Object} payload.wgs84Proj the WGS84 projection contained in list of projections
         * @returns {void}
         */
        addWGS84Decimal (payload) {
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
        },

        /**
         * Initializes the projections to select. If projection EPSG:4326 is available same is added in decimal-degree.

         * @returns {void}
         */
        initProjections () {
            const namedProjections = this.$store.state.namedProjections,
                pr = crs.getProjections(),
                epsg8395 = [],
                wgs84Proj = [];

            if (this.$store.state.projections.length) {
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
                if (proj.id === this.$store.state.currentProjection.id) {
                    this.$store.commit("Tools/DataNarrator/setCurrentProjection", {projection: proj});
                }
            });
            if (wgs84Proj.length > 0) {
                this.addWGS84Decimal({pr, wgs84Proj});
            }
            namedProjections.find((el) => {
                if (el[1].includes("ETRS89_3GK3") && epsg8395.length > 0) {
                    this.addETRS893GK3({pr, el, epsg8395});
                    return true;
                }
                return false;
            });
            this.$store.commit("Tools/DataNarrator/setProjections", {projections: pr});
        },

        /**
         * Adds and processes the selected file.sta
         * @param {number} payload - The ID of the selected file.
         * @param {FileList} payload.files - The selected files.
         * @param {number} payload.fileId - The ID of the selected file.
         * @returns {void}
         */
        importFile (payload) {
            // this.checkMapCollection(fileId);

            const {files, fileId} = payload,
                reader = new FileReader(),
                file = files[0],
                fileName = file.name.split(".")[0],
                fileExtension = file.name.split(".").pop(),
                fileSizeMB = file.size / (1024 * 1024),
                maxFileSizeMB = 100;

            if (fileSizeMB > maxFileSizeMB) {
                this.$store.dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.modeler3D.import.alertingMessages.fileSizeError"), {root: true});
                return;
            }


            if (fileExtension === "gltf") {
                this.handleGltfFile({file, fileName, fileId});
                return;
            }

            this.$store.commit("Tools/DataNarrator/setLoadingState", {loading: true});

            reader.onload = (event) => {
                if (fileExtension === "obj") {
                    this.handleObjFile(event.target.result, fileName, fileId);
                }
                else if (fileExtension === "dae") {
                    this.handleDaeFile(event.target.result, fileName, fileId);
                }
                this.$store.commit("Tools/DataNarrator/setLoadingState", {loading: false});
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
                this.$store.commit("Tools/DataNarrator/setLoadingState", {loading: false});
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
        },

        /**
         * Handles the processing of GLTF content.
         * @param {Object} payload - The payload of the action.
         * @param {Blob} payload.file - The GLTF content.
         * @param {String} payload.fileName - The name of the file.
         * @param {number} payload.fileId - The ID of the selected file.
         * @returns {void}
         */
        handleGltfFile (payload) {
            // this.checkMapCollection(fileId);

            const {file, fileName, fileId} = payload,
                viewer = this.cesiumMap,
                currentLocation = this.cesiumCamera.position,
                hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(0.0), Cesium.Math.toRadians(0.0), Cesium.Math.toRadians(0.0)),

                orientation = Cesium.Transforms.headingPitchRollQuaternion(currentLocation, hpr),

                entity = this.createEntity({
                    viewer,
                    entityId: fileId,
                    name: fileName,
                    scale: 1,
                    orientation: orientation,
                    visibility: true,
                    uri: URL.createObjectURL(file),
                    clampToGround: true,
                    position: currentLocation
                });

            this.$store.commit("Tools/DataNarrator/setSelectedEntityId", {selectedEntityId: entity.id});
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
            this.$store.commit("Tools/DataNarrator/setLoadingState", {loading: false});
        },

        /**
         * Handles the processing of OBJ content.
         * @param {Object} payload - The payload of the action.
         * @param {String} payload.content - The OBJ content.
         * @param {String} payload.fileName - The name of the file.
         * @param {number} payload.fileId - The ID of the selected file.
         * @returns {void}
         */
        handleObjFile (payload) {
            const {content, fileName, fileId} = payload,
                objLoader = new OBJLoader(),
                objData = objLoader.parse(content),
                gltfExporter = new GLTFExporter();

            gltfExporter.parse(objData, (gltfData) => {
                const gltfJson = JSON.stringify(gltfData),
                    blob = new Blob([gltfJson], {type: "model/gltf+json"});

                this.handleGltfFile({file: blob, fileName, fileId});
            });
        },

        /**
         * Handles the processing of a DAE file.
         * @param {Object} payload - The payload of the action.
         * @param {String} payload.content - The OBJ content.
         * @param {String} payload.fileName - The name of the file.
         * @param {number} payload.fileId - The ID of the selected file.
         * @returns {void}
         */
        handleDaeFile (payload) {
            const {content, fileName, fileId} = payload,
                colladaLoader = new ColladaLoader();

            colladaLoader.load(content, (collada) => {
                const exporter = new GLTFExporter();

                exporter.parse(collada.scene, (gltfData) => {
                    const gltfLoader = new GLTFLoader();

                    gltfLoader.parse(gltfData, "", () => {
                        const gltfJson = JSON.stringify(gltfData),
                            blob = new Blob([gltfJson], {type: "model/gltf+json"});

                        this.handleGltfFile({file: blob, fileName, fileId});
                    });
                });
            });
        },


        /**
         * Removes an entity from the viewer.
         * @param {Object} payload payload of the action
         * @param {*} payload.viewer the cesium viewer
         * @param {*} payload.entityId the entity id
         * @returns {void}
         */
        removeEntity (payload) {
            const {entityId} = payload,
                viewer = this.cesiumMap,
                entity = viewer.entities.getById(entityId);

            if (entity) {
                viewer.entities.remove(entity);
            }
        },

        /**
         * Toggles the visibility of an entity.
         * @param {Object} payload payload of the action
         * @param {*} payload.viewer the cesium viewer
         * @param {*} payload.entityId the entity id
         * @returns {void}
         */
        toggleEntityVisibility (payload) {
            const {entityId} = payload,
                viewer = this.cesiumMap,
                entity = viewer.entities.getById(entityId);

            if (entity) {
                entity.show = !entity.show;
            }
        },

        /**
         * Enables the visibility of an entity.
         * @param {Object} payload payload of the action
         * @param {*} payload.viewer the cesium viewer
         * @param {*} payload.entityId the entity id
         * @returns {void}
         */
        enableEntityVisibility (payload) {
            const {entityId} = payload,
                viewer = this.cesiumMap,
                entity = viewer.getDataSourceDisplay().defaultDataSource.entities.getById(entityId);

            if (entity) {
                entity.show = true;
            }
        },


        /**
         * Disables the visibility of an entity.
         * @param {Object} payload payload of the action
         * @param {*} payload.viewer the cesium viewer
         * @param {*} payload.entityId the entity id
         * @returns {void}
         */
        disableEntityVisibility (payload) {
            const {entityId} = payload,
                viewer = this.cesiumMap,
                entity = viewer.entities.getById(entityId);

            if (entity) {
                entity.show = false;
            }
        },

        /**
         * Disables the visibility of all entities.
         * @param {Object} payload payload of the action
         * @param {*} payload.viewer the cesium viewer
         * @returns {void}
         */
        disableAllEntities () {
            try {
                const viewer = this.cesiumMap,
                    entities = viewer.getDataSourceDisplay().defaultDataSource.entities;

                entities.values.forEach(entity => {
                    entity.show = false;
                });
            }
            catch (e) {
                console.error(e);
            }
        },

        /**
         * Changes the location of an entity.
         * @param {Object} payload payload of the action
         * @param {*} payload.entityId the entity id
         * @param {*} payload.newLocation the new location
         * @returns {void}
         */
        changeEntityLocation (payload) {
            const {entityId} = payload,
                viewer = this.cesiumMap,
                entities = viewer.getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(entityId);


            if (entity && entity.position) {
                entity.position = payload.newLocation;
            }
        },

        /**
         * Changes the orientation of an entity.
         * @param {Object} payload payload of the action
         * @param {*} payload.entityId the entity id
         * @param {*} payload.newOrientation the new orientation
         * @returns {void}
         */
        changeEntityOrientation (payload) {
            const {entityId, newOrientation} = payload,
                viewer = this.cesiumMap,
                entities = viewer.getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(entityId);


            if (entity) {
                entity.orientation = newOrientation;
            }
        },

        /**
         * Scales an entity.
         * @param {Object} payload payload of the action
         * @param {*} payload.entityId the entity id
         * @param {*} payload.scale the new scale factor
         * @returns {void}
         */
        scaleEntity (payload) {

            const {entityId, scale} = payload,
                viewer = this.cesiumMap,
                entities = viewer.getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(entityId);

            if (entity && entity.model) {
                entity.model.scale = scale;
            }
        },

        /**
         * Creates and adds an entity to the viewer and state.
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
        createEntity (payload) {
            const {entityId, scale, orientation, visibility, uri, position} = payload,
                viewer = this.cesiumMap,
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
                entity.orientation = orientation;
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
                position: position,
                orientation: orientation
            });


            // entities.add(entity);

            // Add the entity to the state
            this.$store.commit("Tools/DataNarrator/appendImportedEntities", {entity});
            return entity;
        }
    }
};
