<script>
import {mapActions, mapGetters, mapMutations} from "vuex";


import actions from "../../store/actionsDataNarrator";
import * as constants from "../../store/constantsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";

import modelerActions from "../../../../../src/modules/tools/modeler3D/store/actionsModeler3D";
import modelerGetters from "../../../../../src/modules/tools/modeler3D/store/gettersModeler3D";
import modelerMutations from "../../../../../src/modules/tools/modeler3D/store/mutationsModeler3D";

import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import {ColladaLoader} from "three/examples/jsm/loaders/ColladaLoader.js";
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter.js";
import getGfiFeatures from "../../../../../src/api/gfi/getGfiFeaturesByTileFeature";
import crs from "@masterportal/masterportalapi/src/crs";
import {adaptCylinderToGround, adaptCylinderToEntity, adaptCylinderUnclamped} from "../../../../../src/modules/tools/modeler3D/utils/draw";


import {
    mdiCodeJson, mdiFileDocumentOutline, mdiFileExcel, mdiFileImage, mdiFilePdf,
    mdiFolder, mdiFolderOpen, mdiFolderPlus, mdiLanguageHtml5, mdiLanguageMarkdown,
    mdiNodejs, mdiPlus
} from "@mdi/js";
import store from "../../../../../src/app-store";


let eventHandler = null;

export default {
    name: "FileForm",

    components: {

    },

    props: {
        // The initial values for a step to edit
        editedStep: {
            type: Object,
            default: () => ({})
        }
    },
    data () {
        return {
            constants,
            // items: this.editedStep?.threeDLayers || {},
            files: {
                html: mdiLanguageHtml5,
                js: mdiNodejs,
                json: mdiCodeJson,
                md: mdiLanguageMarkdown,
                pdf: mdiFilePdf,
                png: mdiFileImage,
                txt: mdiFileDocumentOutline,
                xls: mdiFileExcel
            },
            tree: [],
            items: [],
            icons: {
                mdiFolder,
                mdiFolderOpen,
                mdiPlus,
                mdiFolderPlus,
                mdiFileDocumentOutline
            },
            addFolderInputOpen: false,
            addFolderInputValue: "",
            targetParentId: "",
            folderRules: [
                value => Boolean(value) || "Required.",
                value => (value && value.length >= 3) || "Min 3 characters"
            ],
            ignoreFolderChange: false,
            forceFolderRerenderKey: 0,
            step: this.editedStep || {}
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),
        ...mapGetters(["namedProjections"]),
        ...mapGetters("Tools/Modeler3D", Object.keys(modelerGetters)),
        ...mapGetters("Maps", ["altitude", "longitude", "latitude", "clickCoordinate", "mouseCoordinate"])


    },
    watch: {


    },
    mounted () {
        // set map to 3d
        console.log("mounted", mapCollection.getMap("3D"));

        // console.log("mounted");
    },
    beforeDestroy () {
        eventHandler.destroy();
        // console.log("beforeDestroy");
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),
        ...mapActions("Tools/Modeler3D", Object.keys(modelerActions)),
        ...mapMutations("Tools/Modeler3D", Object.keys(modelerMutations)),
        ...mapMutations("Tools/Gfi", {setGfiActive: "setActive"}),
        /**
         * Initializes the projections to select. If projection EPSG:4326 is available same is added in decimal-degree.
         * @returns {void}
         */
        initProjections () {
            const pr = crs.getProjections(),
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
                if (proj.id === this.currentProjection.id) {
                    this.setCurrentProjection(proj);
                }
            });
            if (wgs84Proj.length > 0) {
                this.addWGS84Decimal(pr, wgs84Proj);
            }
            this.namedProjections.find((el) => {
                if (el[1].includes("ETRS89_3GK3") && epsg8395.length > 0) {
                    this.addETRS893GK3(pr, el, epsg8395);
                    return true;
                }
                return false;
            });
            this.setProjections(pr);
        },
        /**
         * Adds EPSG:4326 in decimal-degree to list of projections.
         * @param {Array} projections list of all available projections
         * @param {Object} elementETRS89_3GK3 the WGS84 projection contained in list of projections
         * @param {Object} epsg8395 the WGS84 projection contained in list of projections
         * @returns {void}
         */
        addETRS893GK3 (projections, elementETRS89_3GK3, epsg8395) {
            const index = projections.findIndex(proj => proj.name === "EPSG:8395"),
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
         * @param {Array} projections list of all available projections
         * @param {Object} wgs84Proj the WGS84 projection contained in list of projections
         * @returns {void}
         */
        addWGS84Decimal (projections, wgs84Proj) {
            const index = projections.findIndex(proj => proj.name === "EPSG:4326"),
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
        checkMapCollection () {
            if (!eventHandler) {
                const scene = mapCollection.getMap("3D").getCesiumScene();

                this.initProjections();
                eventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

                eventHandler.setInputAction(this.selectObject, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                eventHandler.setInputAction(this.moveEntity, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                eventHandler.setInputAction(this.cursorCheck, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            }
        },

        /**
         * Handles the mouse up event and performs actions when the dragging of an object is finished.
         * @returns {void}
         */
        onMouseUp () {
            if (!this.isDragging) {
                return;
            }
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;

            this.removeInputActions();
            this.setIsDragging(false);

            if (this.cylinderId) {
                const cylinder = entities.getById(this.cylinderId),
                    entity = entities.getById(this.currentModelId);

                cylinder.position = entity?.clampToGround ?
                    adaptCylinderToGround(cylinder, cylinder.position.getValue()) :
                    adaptCylinderToEntity(entity, cylinder, cylinder.position.getValue());
                this.setCylinderId(null);
            }
            else if (this.wasDrawn) {
                const cylinders = entities.values.filter(ent => ent.cylinder),
                    entity = entities.getById(this.currentModelId);

                cylinders.forEach((cyl) => {
                    cyl.position = entity?.clampToGround ?
                        adaptCylinderToGround(cyl, cyl.position.getValue()) :
                        adaptCylinderToEntity(entity, cyl, cyl.position.getValue());
                });
            }
            this.setHideObjects(this.originalHideOption);

            document.body.style.cursor = "auto";
        },

        /**
         * Handles the mouse move event and performs actions when dragging a cylinder.
         * @param {Event} event - The event object containing the position information.
         * @returns {void}
         */
        moveCylinder (event) {
            if (!this.isDragging || this.isDrawing) {
                return;
            }

            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId),
                cylinder = entities.getById(this.cylinderId);

            if (Cesium.defined(cylinder) && Cesium.defined(entity)) {
                const scene = mapCollection.getMap("3D").getCesiumScene();

                if (entity.clampToGround) {
                    const ray = scene.camera.getPickRay(event.endPosition),
                        position = scene.globe.pick(ray, scene);

                    if (this.currentPosition !== position) {
                        this.currentPosition = scene.globe.pick(ray, scene);
                        this.updatePositionUI();
                    }
                }
                else {
                    const transformedCoordinates = crs.transformFromMapProjection(mapCollection.getMap("3D").getOlMap(), "EPSG:4326", [this.mouseCoordinate[0], this.mouseCoordinate[1]]),
                        cartographic = Cesium.Cartographic.fromDegrees(transformedCoordinates[0], transformedCoordinates[1]);

                    cartographic.height = scene.sampleHeight(cartographic, [cylinder, entity]);

                    if (this.currentPosition !== Cesium.Cartographic.toCartesian(cartographic)) {
                        this.currentPosition = Cesium.Cartographic.toCartesian(cartographic);
                        this.updatePositionUI();
                    }
                }
                if (Cesium.defined(this.currentPosition)) {
                    this.activeShapePoints.splice(cylinder.positionIndex, 1, this.currentPosition);
                }
            }
        },

        /**
         * Initiates the process of moving an entity.
         * @param {Event} event - The event object containing the position information.
         * @returns {void}
         */
        moveEntity (event) {

            this.checkMapCollection();

            if (this.isDrawing) {
                return;
            }


            let entity;

            if (event) {
                const scene = mapCollection.getMap("3D").getCesiumScene(),
                    picked = scene.pick(event.position);

                entity = Cesium.defaultValue(picked?.id, picked?.primitive?.id);
            }

            if (entity instanceof Cesium.Entity || !event) {
                const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;

                this.setIsDragging(true);
                this.originalHideOption = this.hideObjects;
                this.setHideObjects(false);

                document.body.style.cursor = "grabbing";

                if (entity?.cylinder) {
                    const geometry = entities.getById(this.currentModelId),
                        position = geometry.polygon ? geometry.polygon.hierarchy.getValue().positions[entity.positionIndex] : geometry.polyline.positions.getValue()[entity.positionIndex];

                    this.currentPosition = position;

                    entity.position = geometry.clampToGround ?
                        new Cesium.CallbackProperty(() => adaptCylinderToGround(entity, this.currentPosition), false) :
                        new Cesium.CallbackProperty(() => adaptCylinderToEntity(geometry, entity, this.currentPosition), false);
                    eventHandler.setInputAction(this.moveCylinder, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                }
                else {
                    entities.values.filter(ent => ent.cylinder).forEach((cyl, index) => {
                        this.cylinderPosition[index] = cyl.position.getValue();

                        cyl.position = entity.clampToGround ?
                            new Cesium.CallbackProperty(() => adaptCylinderToGround(cyl, this.cylinderPosition[index]), false) :
                            new Cesium.CallbackProperty(() => adaptCylinderToEntity(entity, cyl, this.cylinderPosition[index]), false);
                    });

                    eventHandler.setInputAction(this.onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                }
                eventHandler.setInputAction(this.onMouseUp, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            }
        },
        /**
         * Handles the mouse move event and performs actions when dragging an object.
         * @param {Event} event - The event object containing the position information.
         * @returns {void}
         */
        onMouseMove (event) {
            if (!this.isDragging) {
                return;
            }

            const scene = mapCollection.getMap("3D").getCesiumScene(),
                ray = scene.camera.getPickRay(event.endPosition),
                position = scene.globe.pick(ray, scene),
                entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId);

            if (!Cesium.defined(position) || !Cesium.defined(entity)) {
                return;
            }

            if (entity.polygon) {
                this.movePolygon({entityId: this.currentModelId, position});
            }
            else if (entity.polyline) {
                this.movePolyline({entityId: this.currentModelId, position});
            }
            else {
                entity.position = position;
            }
            this.updatePositionUI();
        },

        /**
         * Checks the map for pickable Cesium objects and changes the cursor on hover.
         * @param {Event} event - The event object containing the position information.
         * @returns {void}
         */
        cursorCheck (event) {
            if (this.isDrawing) {
                return;
            }
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                picked = scene.pick(event.endPosition),
                entity = Cesium.defaultValue(picked?.id, picked?.primitive?.id);

            if (Cesium.defined(entity) && entity instanceof Cesium.Entity) {
                if (this.currentModelId && entity.id === this.currentModelId || entity.cylinder) {
                    document.body.style.cursor = "grab";
                }
                else {
                    document.body.style.cursor = "pointer";
                }
            }
            else if (this.hideObjects && Cesium.defined(picked) && picked instanceof Cesium.Cesium3DTileFeature) {
                document.body.style.cursor = "pointer";
            }
            else {
                document.body.style.cursor = "auto";
            }
        },
        /**
         * Selects an object based on the provided event.
         * @param {Event} event - The event object containing the position information.
         * @returns {void}
         */
        selectObject (event) {
            if (this.isDrawing) {
                return;
            }
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                picked = scene.pick(event.position);

            if (Cesium.defined(picked)) {
                const entity = Cesium.defaultValue(picked?.id, picked?.primitive?.id);

                if (entity instanceof Cesium.Entity) {
                    if (entity.cylinder) {
                        this.setCylinderId(entity.id);
                    }
                    else {
                        this.setCurrentModelId(entity.id);
                        this.setCylinderId(null);
                    }
                }
                else if (this.hideObjects && picked instanceof Cesium.Cesium3DTileFeature) {
                    const features = getGfiFeatures.getGfiFeaturesByTileFeature(picked),
                        gmlId = features[0]?.getProperties()[this.gmlIdPath],
                        tileSetModels = this.updateAllLayers ?
                            Radio.request("ModelList", "getModelsByAttributes", {typ: "TileSet3D"}) :
                            Radio.request("ModelList", "getModelsByAttributes", {typ: "TileSet3D", id: picked.tileset.layerReferenceId});

                    tileSetModels.forEach(model => model.hideObjects([gmlId], this.updateAllLayers));

                    this.hiddenObjects.push({
                        name: gmlId
                    });
                }
            }
        },
        /**
         * Removes the input actions related to mouse move and left double click events.
         * @returns {void}
         */
        removeInputActions () {
            if (eventHandler) {
                eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                eventHandler.setInputAction(this.cursorCheck, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                eventHandler.setInputAction(this.moveEntity, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            }
        },

        /**
         * Shows the specified object by making it visible in the scene.
         * @param {Object} object - The object to show.
         * @returns {void}
         */
        showObject (object) {
            const objectIndex = this.hiddenObjects.findIndex(x => x.name === object.name),
                tileSetModels = Radio.request("ModelList", "getModelsByAttributes", {typ: "TileSet3D"});

            tileSetModels[0].showObjects([object.name]);
            this.hiddenObjects.splice(objectIndex, 1);
        },

        /**
         * Handles the Escape key press to reset the camera perspective.
         * @param {KeyboardEvent} e - The event object for the keyboard event.
         * @returns {void}
         */
        escapeKeyHandler (e) {
            const scene = mapCollection.getMap("3D").getCesiumScene();

            if (e.code === "Escape") {
                scene.camera.flyTo({
                    destination: this.currentCartesian,
                    complete: () => {
                        scene.screenSpaceCameraController.enableZoom = true;
                        scene.screenSpaceCameraController.enableRotate = true;

                        eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                        document.removeEventListener("keydown", this.escapeKeyHandler);
                        document.body.style.cursor = this.originalCursorStyle;
                        this.changeCursor();
                    }
                });
            }
        },

        /**
         * Highlights the specified entity by applying the configured or default highlight style.
         * @param {Cesium.Entity} entity - The entity to highlight.
         * @returns {void}
         */
        highlightEntity (entity) {
            const color = this.highlightStyle.color,
                alpha = this.highlightStyle.alpha,
                silhouetteColor = this.highlightStyle.silhouetteColor,
                silhouetteSize = this.highlightStyle.silhouetteSize;

            if (entity.wasDrawn) {
                if (entity.polygon) {
                    entity.originalColor = entity.polygon.material.color;
                    entity.originalOutlineColor = entity.polygon.outlineColor;
                    entity.polygon.material.color = Cesium.Color.fromAlpha(
                        Cesium.Color.fromCssColorString(color),
                        parseFloat(alpha)
                    );
                    entity.polygon.outline = true;
                    entity.polygon.outlineColor = Cesium.Color.fromCssColorString(silhouetteColor);
                }
                else if (entity.polyline) {
                    entity.originalColor = entity.polyline.material.color;
                    entity.polyline.material.color = Cesium.Color.fromAlpha(
                        Cesium.Color.fromCssColorString(color),
                        parseFloat(alpha)
                    );
                }
            }
            else {
                entity.model.color = Cesium.Color.fromAlpha(
                    Cesium.Color.fromCssColorString(color),
                    parseFloat(alpha)
                );
                entity.model.silhouetteColor = Cesium.Color.fromCssColorString(silhouetteColor);
                entity.model.silhouetteSize = parseFloat(silhouetteSize);
                entity.model.colorBlendMode = Cesium.ColorBlendMode.HIGHLIGHT;
            }
        },

        /**
         * Adds and processes the selected file.
         * @param {FileList} files - The selected files.
         * @returns {void}
         */
        addFile (files) {
            this.checkMapCollection();


            console.log("addFile", files);
            const reader = new FileReader(),
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
                this.handleGltfFile(file, fileName);
                return;
            }

            this.setIsLoading(true);

            reader.onload = (event) => {
                if (fileExtension === "obj") {
                    this.handleObjFile(event.target.result, fileName);
                }
                else if (fileExtension === "dae") {
                    this.handleDaeFile(event.target.result, fileName);
                }
                else if (fileExtension === "geojson") {
                    this.handleGeoJsonFile(event.target.result);
                }
                else {
                    store.dispatch("Alerting/addSingleAlert", {content: i18next.t("common:modules.tools.modeler3D.import.alertingMessages.missingFormat", {format: fileExtension})}, {root: true});
                    this.setIsLoading(false);
                }
            };

            reader.onerror = (e) => {
                console.error("Error reading the file:", e.target.error);
                this.setIsLoading(false);
            };

            if (fileExtension === "dae") {
                reader.readAsDataURL(file);
            }
            else {
                reader.readAsText(file);
            }
        },

        /**
         * Handles the processing of GLTF content.
         * @param {Blob} blob - The GLTF content.
         * @param {String} fileName - The name of the file.
         * @returns {void}
         */
        handleGltfFile (blob, fileName) {
            this.checkMapCollection();
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                lastElement = entities.values.slice().pop(),
                lastId = lastElement?.id,
                models = this.importedModels,
                entity = new Cesium.Entity({
                    id: lastId ? lastId + 1 : 1,
                    name: fileName,
                    clampToGround: true,
                    model: {
                        uri: URL.createObjectURL(blob)
                    }
                });


            this.setCurrentModelId(entity.id);
            this.moveEntity();

            entities.add(entity);

            models.push({
                id: entity.id,
                name: fileName,
                show: true,
                edit: false,
                heading: 0
            });
            this.setImportedModels(models);
            this.setIsLoading(false);
        },
        /**
         * Handles the processing of OBJ content.
         * @param {String} content - The OBJ content.
         * @param {String} fileName - The name of the file.
         * @returns {void}
         */
        handleObjFile (content, fileName) {
            const objLoader = new OBJLoader(),
                objData = objLoader.parse(content),
                gltfExporter = new GLTFExporter();

            gltfExporter.parse(objData, (gltfData) => {
                const gltfJson = JSON.stringify(gltfData),
                    blob = new Blob([gltfJson], {type: "model/gltf+json"});

                this.handleGltfFile(blob, fileName);
            });
        },
        /**
         * Handles the processing of a DAE file.
         * @param {String} content - The DAE content.
         * @param {String} fileName - The name of the file.
         * @returns {void}
         */
        handleDaeFile (content, fileName) {
            const colladaLoader = new ColladaLoader();

            colladaLoader.load(content, (collada) => {
                const exporter = new GLTFExporter();

                exporter.parse(collada.scene, (gltfData) => {
                    const gltfLoader = new GLTFLoader();

                    gltfLoader.parse(gltfData, "", () => {
                        const gltfJson = JSON.stringify(gltfData),
                            blob = new Blob([gltfJson], {type: "model/gltf+json"});

                        this.handleGltfFile(blob, fileName);
                    });
                });
            });
        },
        /**
         * Handles the processing of GeoJSON content.
         * @param {String} content - The GeoJSON content.
         * @param {String} fileName - The name of the file.
         * @returns {void}
         */
        handleGeoJsonFile (content) {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                geojson = JSON.parse(content);

            geojson.features.forEach(feature => {
                const properties = feature.properties,
                    color = properties.color,
                    outlineColor = properties.outlineColor,
                    coordinates = feature.geometry.coordinates[0],
                    lastElement = entities.values.slice().pop(),
                    lastId = lastElement?.id,
                    entity = new Cesium.Entity({
                        id: lastId ? lastId + 1 : 1,
                        name: properties.name,
                        wasDrawn: true,
                        clampToGround: properties.clampToGround
                    });

                if (feature.geometry.type === "Polygon") {
                    entity.polygon = {
                        material: new Cesium.ColorMaterialProperty(
                            new Cesium.Color(color.red, color.green, color.blue, color.alpha)
                        ),
                        outline: true,
                        outlineColor: new Cesium.Color(outlineColor.red, outlineColor.green, outlineColor.blue, outlineColor.alpha),
                        outlineWidth: 1,
                        height: coordinates[0][2],
                        extrudedHeight: properties.extrudedHeight,
                        shadows: Cesium.ShadowMode.ENABLED,
                        hierarchy: new Cesium.PolygonHierarchy(coordinates.map(point => Cesium.Cartesian3.fromDegrees(point[0], point[1])))
                    };
                }
                else if (feature.geometry.type === "Polyline") {
                    entity.polyline = {
                        material: new Cesium.ColorMaterialProperty(
                            new Cesium.Color(color.red, color.green, color.blue, color.alpha)
                        ),
                        width: properties.width,
                        positions: coordinates.map(point => Cesium.Cartesian3.fromDegrees(point[0], point[1], point[2]))
                    };
                }

                entities.add(entity);
                this.drawnModels.push({
                    id: entity.id,
                    name: entity.name,
                    show: true,
                    edit: false
                });
            });

            this.setCurrentView("draw");
            this.setIsLoading(false);
        },
        /**
         * Toggles the visibility of a model entity.
         * @param {object} model - The model object.
         * @returns {void}
         */
        changeVisibility (model) {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(model.id);

            entity.show = !model.show;
            model.show = entity.show;
        },
        /**
         * Zooms the camera to the specified entity.
         * @param {string} id - The ID of the entity to zoom to.
         * @returns {void}
         */
        zoomTo (id) {
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(id),
                entityPosition = entity.position.getValue(),
                destination = Cesium.Cartographic.fromCartesian(entityPosition);

            scene.camera.flyTo({
                destination: Cesium.Cartesian3.fromRadians(destination.longitude, destination.latitude, destination.height + 250)
            });
        },

        addFolder (parentId = null, asChild = true) {
            this.targetParentId = parentId;
            this.addFolderInputOpen = true;
            const addFolderInput = this.$refs.addFolderInput;

            addFolderInput.focus();
            // console.log("addFolder", parentId, asChild);
            // this.addItem(parentId, {
            //     id: this.randomId(),
            //     name: "new folder"
            // }, asChild);
        },

        /**
         * Save the new folder
         * @returns {void}
         */
        saveNewFolder () {
            if (this.ignoreFolderChange === false) {
                this.addItem(this.targetParentId, {
                    id: this.randomId(),
                    name: this.addFolderInputValue
                }, true);
                this.resetFolderInput();

            }
        },

        handleFolderInput (value) {
            this.addFolderInputValue = value;
        },

        resetFolderInput () {
            this.ignoreFolderChange = true;

            this.addFolderInputOpen = false;
            this.addFolderInputValue = "";

            this.forceFolderRerenderKey++;
            this.$nextTick(() => {
                this.ignoreFolderChange = false;
            });
        },

        addItem (parentId, newItem, asChild = true) {
            // Create a copy of the items
            const itemsCopy = JSON.parse(JSON.stringify(this.items));

            if (!parentId) {
                // If no parent id is provided, add the item to the root
                itemsCopy.push(newItem);
                // Update the original items with the modified copy
                this.items = itemsCopy;
                return;
            }

            /**
             * Recursive function to add an item to the tree
             * @param {Array} items the items to search
             * @param {string} pId the id of the parent item
             * @param {*} nItem the new item to add
             * @returns {boolean} true if the item was added, false otherwise
             */
            function addRecursive (items, pId, nItem) {
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];

                    if (item.id === pId) {
                        // If the item is found and we are adding as a child
                        if (asChild) {
                            if (!item.children) {
                                item.children = []; // Initialize children array if not present
                            }
                            item.children.push(nItem);
                        }
                        else {
                            // If we are adding as a sibling
                            items.splice(i + 1, 0, nItem);
                        }
                        return true;
                    }
                    // If the item has children, recursively search them
                    if (item.children && addRecursive(item.children, pId, nItem)) {
                        return true;
                    }
                }
                return false;
            }

            // Use the copied items for recursive addition
            addRecursive(itemsCopy, parentId, newItem);

            // Update the original items with the modified copy
            this.items = itemsCopy;
        },


        renameItem (itemId, newName) {
            /**
             * Function to recursively search and rename the item
             * @param {Array} items the items to search
             * @returns {boolean} true if the item was renamed, false otherwise
             */
            function renameRecursive (items) {
                for (const item of items) {
                    if (item.id === itemId) {
                        item.name = newName;
                        return true;
                    }
                    // If the item has children, recursively search them
                    if (item.children && renameRecursive(item.children)) {
                        return true;
                    }
                }
                return false;
            }

            renameRecursive(this.items);
        },

        openFileDialog (index) {
            const element = this.$refs["fileInput" + index];

            element.click();
        },

        randomId () {
            let d = new Date().getTime(), // Timestamp
                d2 = ((typeof performance !== "undefined") && performance.now && (performance.now() * 1000)) || 0;// Time in microseconds since page-load or 0 if unsupported

            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
                let r = Math.random() * 16;// random number between 0 and 16

                if (d > 0) { // Use timestamp until depleted
                    r = (d + r) % 16 | 0;
                    d = Math.floor(d / 16);
                }
                else { // Use microseconds since page-load if supported
                    r = (d2 + r) % 16 | 0;
                    d2 = Math.floor(d2 / 16);
                }
                return (c === "x" ? r : r & 0x3 | 0x8).toString(16);
            });
        },

        handleFileUpload (event, itemId) {
            console.log("handleFileUpload", event.target.files, mapCollection.getMap("3D"));
            this.addFile(event.target.files);

            const files = event.target.files;

            for (const file of files) {
                this.addItem(itemId, {
                    id: this.randomId(),
                    name: file.name,
                    file: file.name.split(".").pop(),
                    obj: file
                }, true);
            }


            // console.log("handleFileUpload", files);
        },

        createFormData () {
            const formData = new FormData();

            /**
             * Recursive function to process the tree and add files to FormData
             * @param {Array} node the tree to process
             * @param {string} path the path of the current node
             * @returns {void}
             */
            function processNode (node, path = "") {
                if (node.file && node.obj) {
                    // It's a file, append it to FormData
                    const fullPath = path;


                    formData.append(fullPath, node.obj);
                }
                else if (node.children && Array.isArray(node.children)) {
                    // It's a folder, recurse into its children
                    node.children.forEach(child => {
                        processNode(child, path ? `${path}/${node.name}` : node.name);
                    });
                }
            }

            this.items.forEach(node => {
                processNode(node);
            });

            for (const [key, value] of formData.entries()) {
                console.log(key, value);
            }


            this.step.threeDFiles = formData;

            this.returnToStepForm();

        },

        /**
         * Handle return back to the stepForm
         * @returns {void}
         */
        returnToStepForm () {
            this.$emit("return", this.step);
        }


    }
};
</script>

<template lang="html">
    <div
        id="tool-dataNarrator-creator-3dForm"
        class="mb-8"
    >
        <h4>
            {{
                $t("additional:modules.tools.dataNarrator.3dForm")
            }}
        </h4>
        <span class="fileActions">
            <div
                :class="['addFolderInput', { 'addFolderInput--open': addFolderInputOpen }]"
            >
                <v-text-field
                    :key="forceFolderRerenderKey"
                    ref="addFolderInput"
                    :value="addFolderInputValue"
                    label="Folder name"
                    :rules="folderRules"
                    hide-details="auto"
                    @change="saveNewFolder"
                    @input="handleFolderInput"
                />
            </div>

            <v-btn
                icon
                @click="() => addFolder(null, false)"
            ><v-icon>{{ icons.mdiFolderPlus }}</v-icon></v-btn>
        </span>
        <v-treeview
            v-model="tree"
            :items="items"
            item-children="children"
            activatable
            open-all
        >
            <template #prepend="{ item, open }">
                <v-icon v-if="!item.file">
                    {{ open ? icons.mdiFolderOpen : icons.mdiFolder }}
                </v-icon>
                <v-icon v-else>
                    {{ files[item.file] ? files[item.file] : icons.mdiFileDocumentOutline }}
                </v-icon>
            </template>

            <template #label="{ item }">
                <div
                    :key="item.id"
                    class="fileLabel"
                >
                    <div>
                        <label :for="'fileInput' + item.id">{{ item.name }}</label>
                        <input
                            :id="'fileInput' + item.id"
                            :ref="'fileInput' + item.id"
                            type="file"
                            hidden
                            multiple
                            @change="(event) => handleFileUpload(event, item.id)"
                        >
                    </div>

                    <div :v-if="!item.file">
                        <v-btn
                            icon
                            @click.stop="openFileDialog(item.id)"
                        >
                            <v-icon>{{ icons.mdiPlus }}</v-icon>
                        </v-btn>
                        <v-btn
                            icon
                            @click.stop="() => addFolder(item.id, true)"
                        >
                            <v-icon>{{ icons.mdiFolderPlus }}</v-icon>
                        </v-btn>
                    </div>
                </div>
            </template>
        </v-treeview>
        <span>
            <v-btn
                color="primary"
                @click="() => createFormData()"
            >
                save
            </v-btn>
        </span>
    </div>
</template>

<style lang="scss" scoped>

#tool-dataNarrator-creator-3dForm {
    max-width: 460px;
    position: relatieve;

    .fileActions {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        width: 100%;
    }

    .fileLabel {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    .addFolderInput {
        display: none;

        &--open {
            display: block;
        }
    }
}
</style>
