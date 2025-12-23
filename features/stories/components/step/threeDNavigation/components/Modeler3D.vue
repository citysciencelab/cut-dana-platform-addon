<script setup>
import crs from '@masterportal/masterportalapi/src/crs';
import { ref, computed, toRef, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useStore } from 'vuex';

import initProjections from '../../../../../../../../../src/shared/js/utils/initProjections';

const store = useStore();

const namedProjections = computed(() => store.getters['namedProjections']);

const currentModelId = computed(() => store.getters['Modules/Modeler3D/currentModelId']);
const currentProjection = computed(() => store.getters['Modules/Modeler3D/currentProjection']);
const cylinderId = computed(() => store.getters['Modules/Modeler3D/cylinderId']);
const drawRotation = computed(() => store.getters['Modules/Modeler3D/drawRotation']);
const extrudedHeight = computed(() => store.getters['Modules/Modeler3D/extrudedHeight']);
const getCenterFromGeometry = computed(() => store.getters['Modules/Modeler3D/getCenterFromGeometry']);
const gmlIdPath = computed(() => store.getters['Modules/Modeler3D/gmlIdPath']);
const height = computed(() => store.getters['Modules/Modeler3D/height']);
const hideObjects = computed(() => store.getters['Modules/Modeler3D/hideObjects']);
const highlightStyle = computed(() => store.getters['Modules/Modeler3D/highlightStyle']);
const isDragging = computed(() => store.getters['Modules/Modeler3D/isDragging']);
const isDrawing = computed(() => store.getters['Modules/Modeler3D/isDrawing']);
const movingEntity = computed(() => store.getters['Modules/Modeler3D/movingEntity']);
const povActive = computed(() => store.getters['Modules/Modeler3D/povActive']);
const projections = computed(() => store.getters['Modules/Modeler3D/projections']);
const updateAllLayers = computed(() => store.getters['Modules/Modeler3D/updateAllLayers']);
const useAnchorMove = computed(() => store.getters['Modules/Modeler3D/useAnchorMove']);

const clickCoordinate = computed(() => store.getters['Maps/clickCoordinate']);
const mouseCoordinate = computed(() => store.getters['Maps/mouseCoordinate']);

const m3dState = store.state.Modules.Modeler3D;
const activeShapePoints = toRef(m3dState, 'activeShapePoints');
const hiddenObjects = toRef(m3dState, 'hiddenObjects');
const hiddenObjectsWithLayerId = toRef(m3dState, 'hiddenObjectsWithLayerId');
const importedEntities = toRef(m3dState, 'importedEntities');

const createCylinder = (payload) => store.dispatch('Modules/Modeler3D/createCylinder', payload);
const generateCylinders = (entity) => store.dispatch('Modules/Modeler3D/generateCylinders', entity);
const movePolygon = (payload) => store.dispatch('Modules/Modeler3D/movePolygon', payload);
const movePolyline = (payload) => store.dispatch('Modules/Modeler3D/movePolyline', payload);
const moveAdjacentRectangleCorners = (payload) => store.dispatch('Modules/Modeler3D/moveAdjacentRectangleCorners', payload);
const removeCylinders = () => store.dispatch('Modules/Modeler3D/removeCylinders');
const updatePositionUI = () => store.dispatch('Modules/Modeler3D/updatePositionUI');
const updateUI = () => store.dispatch('Modules/Modeler3D/updateUI');

const setActiveShapePoints = (val) => store.commit('Modules/Modeler3D/setActiveShapePoints', val);
const setCurrentModelId = (val) => store.commit('Modules/Modeler3D/setCurrentModelId', val);
const setCurrentModelPosition = (val) => store.commit('Modules/Modeler3D/setCurrentModelPosition', val);
const setCurrentProjection = (val) => store.commit('Modules/Modeler3D/setCurrentProjection', val);
const setCurrentView = (val) => store.commit('Modules/Modeler3D/setCurrentView', val);
const setCylinderId = (val) => store.commit('Modules/Modeler3D/setCylinderId', val);
const setExtrudedHeight = (val) => store.commit('Modules/Modeler3D/setExtrudedHeight', val);
const setHideObjects = (val) => store.commit('Modules/Modeler3D/setHideObjects', val);
const setIsDragging = (val) => store.commit('Modules/Modeler3D/setIsDragging', val);
const setLineWidth = (val) => store.commit('Modules/Modeler3D/setLineWidth', val);
const setMovingEntity = (val) => store.commit('Modules/Modeler3D/setMovingEntity', val);
const setPovActive = (val) => store.commit('Modules/Modeler3D/setPovActive', val);
const setProjections = (val) => store.commit('Modules/Modeler3D/setProjections', val);
const setUseAnchorMove = (val) => store.commit('Modules/Modeler3D/setUseAnchorMove', val);

const currentCartesian = ref(null);
const currentPosition = ref(null);
const lastAction = ref(null);
const originalCursorStyle = ref(null);
const originalPosition = ref(null);
const undonePosition = ref(null);

const eventHandler = ref(null);
const preRenderListener = ref(null);
const originalHideOption = ref(null);
const wasDrawn = ref(false);

function resetOldEntity(oldEntity) {
  const scene = mapCollection.getMap('3D').getCesiumScene();

  if (oldEntity.wasDrawn) {
    resetDrawnEntity(oldEntity);
  } else {
    resetModelEntity(oldEntity);
    setCurrentView('modeler-import');
  }
  scene.requestRender();
  setCurrentModelPosition(null);
}

function resetDrawnEntity(entity) {
  if (entity.polygon) {
    const entities = mapCollection.getMap('3D').getDataSourceDisplay().defaultDataSource.entities;
    const outlines = entities.values.filter(ent => ent.outline && ent.polyline);
    outlines.forEach(outline => entities.remove(outline));

    entity.polygon.hierarchy = new Cesium.ConstantProperty(new Cesium.PolygonHierarchy(activeShapePoints.value));
    entity.polygon.outline = true;
    setExtrudedHeight(20);
  } else if (entity.polyline) {
    entity.polyline.positions = new Cesium.ConstantProperty(activeShapePoints.value);
    entity.polyline.material.color = entity.originalColor;
    entity.polyline.width = entity.originalWidth;
  }
  entity.rotation = (entity.rotation || 0) + drawRotation.value;
  removeCylinders();
  setActiveShapePoints([]);
  setCylinderId(null);
}

function resetModelEntity(entity) {
  entity.model.silhouetteColor = null;
  entity.model.silhouetteSize = 0;
  entity.model.colorBlendAmount = 0;
}

function setupNewEntity(newEntity) {
  if (newEntity.wasDrawn) {
    setCurrentView('modeler-draw');
    if (newEntity.polygon) {
      setActiveShapePoints(newEntity.polygon.hierarchy.getValue().positions);
      newEntity.polygon.hierarchy = new Cesium.CallbackProperty(
        () => new Cesium.PolygonHierarchy(activeShapePoints.value),
        false
      );
    } else if (newEntity.polyline) {
      setActiveShapePoints(newEntity.polyline.positions.getValue());
      newEntity.polyline.positions = new Cesium.CallbackProperty(() => activeShapePoints.value);
    }
    generateCylinders(newEntity);
  }
  if (newEntity.model) {
    setCurrentView('modeler-import');
  }
  highlightEntity(newEntity);
  setCurrentModelPosition(newEntity?.position?.getValue() || getCenterFromGeometry.value(newEntity));
  updateUI();
}

function initProjectionsInModeler3D() {
  const projectionsObj = initProjections(crs, projections.value, namedProjections.value, currentProjection.value);

  if (projectionsObj?.currentProjection) {
    setCurrentProjection(projectionsObj.currentProjection);
  }
  if (projectionsObj?.projections) {
    setProjections(projectionsObj.projections);
  }
}

function cursorCheck(event) {
  if (isDrawing.value) return;

  const scene = mapCollection.getMap('3D').getCesiumScene();
  const picked = scene.drillPick(event.endPosition).filter(pickedObj => !pickedObj?.id?.label && !pickedObj?.id?.outline);
  const entity = Cesium.defaultValue(picked[0]?.id, picked[0]?.primitive?.id);

  if (Cesium.defined(entity) && entity instanceof Cesium.Entity) {
    if ((currentModelId.value && entity.id === currentModelId.value) || entity.cylinder) {
      document.getElementById('map').style.cursor = 'grab';
    } else {
      document.getElementById('map').style.cursor = 'pointer';
    }
  } else if (hideObjects.value && Cesium.defined(picked[0]) && picked[0] instanceof Cesium.Cesium3DTileFeature) {
    document.getElementById('map').style.cursor = 'pointer';
  } else {
    document.getElementById('map').style.cursor = 'auto';
  }
}

function moveEntity(event) {
  if (isDrawing.value || povActive.value) return;

  let entity;

  if (event) {
    const scene = mapCollection.getMap('3D').getCesiumScene();
    const picked = scene.drillPick(event.position).filter(pickedObj => !pickedObj?.id?.label && !pickedObj?.id?.outline);
    entity = Cesium.defaultValue(picked[0]?.id, picked[0]?.primitive?.id);
  }

  if (entity instanceof Cesium.Entity || !event) {
    const entities = mapCollection.getMap('3D').getDataSourceDisplay().defaultDataSource.entities;
    const scene = mapCollection.getMap('3D').getCesiumScene();

    setIsDragging(true);
    scene.screenSpaceCameraController.enableInputs = false;
    setHideObjects(false);
    eventHandler.value.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

    eventHandler.value.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    document.getElementById('map').style.cursor = 'grabbing';

    if (entity?.cylinder) {
      const geometry = entities.getById(currentModelId.value);
      const position = geometry.polygon
        ? geometry.polygon.hierarchy.getValue().positions[entity.positionIndex]
        : geometry.polyline.positions.getValue()[entity.positionIndex];

      currentPosition.value = position;
      originalPosition.value = {
        entityId: entity.positionIndex,
        attachedEntityId: entity.attachedEntityId,
        position
      };

      setCylinderId(entity.id);
      eventHandler.value.setInputAction(moveCylinder, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    } else if (entity?.wasDrawn) {
      originalPosition.value = { entityId: entity.id, position: getCenterFromGeometry.value(entity) };
      eventHandler.value.setInputAction(selectObject, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      if (currentModelId.value && currentModelId.value === entity.id) {
        eventHandler.value.setInputAction(onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      }
    } else {
      originalPosition.value = entity ? { entityId: entity.id, position: entity.position.getValue() } : null;
      eventHandler.value.setInputAction(onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      if (importedEntities.value.length) {
        const importedEntity = importedEntities.value.find(importEntity => importEntity.entityId === entity?.id);
        if (importedEntity) {
          importedEntity.position = entity.position.getValue();
          eventHandler.value.setInputAction(selectObject, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
      }
    }
    eventHandler.value.setInputAction(onMouseUp, Cesium.ScreenSpaceEventType.LEFT_UP);
  }
}

function selectObject(event) {
  if (isDrawing.value || povActive.value) return;

  let entity = null;
  const scene = mapCollection.getMap('3D').getCesiumScene();
  const picked = scene.drillPick(event.position).filter(pickedObj => !pickedObj?.id?.label && !pickedObj?.id?.outline);

  if (!Cesium.defined(picked[0])) return;

  entity = Cesium.defaultValue(picked[0]?.id, picked[0]?.primitive?.id);

  if (entity instanceof Cesium.Entity && !entity.cylinder) {
    setCurrentModelId(entity.id);
    setCylinderId(null);
  } else if (hideObjects.value && picked[0] instanceof Cesium.Cesium3DTileFeature) {
    // eslint-disable-next-line no-undef
    const features = getGfiFeatures.getGfiFeaturesByTileFeature(picked[0]);
    const gmlId = features[0]?.getProperties()[gmlIdPath.value];
    const tileSetLayers = updateAllLayers.value
      // eslint-disable-next-line no-undef
      ? layerCollection.getLayers().filter(layer => layer.get('typ') === 'TileSet3D')
      // eslint-disable-next-line no-undef
      : layerCollection.getLayers().filter(layer => layer.get('typ') === 'TileSet3D' && layer.get('id') === picked[0].tileset.layerReferenceId);

    tileSetLayers.forEach(layer => layer.addToHiddenObjects([ gmlId ], updateAllLayers.value));

    hiddenObjects.value.push({ name: gmlId });
    hiddenObjectsWithLayerId.value.push({
      name: gmlId,
      layerId: picked[0].tileset.layerReferenceId
    });
  }
}

function moveCylinder(event) {
  if (!isDragging.value || isDrawing.value) return;

  const entities = mapCollection.getMap('3D').getDataSourceDisplay().defaultDataSource.entities;
  const entity = entities.getById(currentModelId.value);
  const cylinder = entities.getById(cylinderId.value);

  if (Cesium.defined(cylinder) && Cesium.defined(entity)) {
    const scene = mapCollection.getMap('3D').getCesiumScene();

    if (entity.clampToGround) {
      const ray = scene.camera.getPickRay(event.endPosition);
      const position = scene.globe.pick(ray, scene);

      if (activeShapePoints.value[cylinder.positionIndex] !== position) {
        activeShapePoints.value.splice(cylinder.positionIndex, 1, scene.globe.pick(ray, scene));
        updatePositionUI();
      }
    } else {
      const transformedCoordinates = crs.transformFromMapProjection(
        mapCollection.getMap('3D').getOlMap(),
        'EPSG:4326',
        [ mouseCoordinate.value[0], mouseCoordinate.value[1] ]
      );
      const cartographic = Cesium.Cartographic.fromDegrees(transformedCoordinates[0], transformedCoordinates[1]);

      cartographic.height = scene.sampleHeight(cartographic, [ cylinder, entity ]);

      if (activeShapePoints.value[cylinder.positionIndex] !== Cesium.Cartographic.toCartesian(cartographic)) {
        activeShapePoints.value.splice(cylinder.positionIndex, 1, Cesium.Cartographic.toCartesian(cartographic));
        updatePositionUI();
      }
    }

    if (Cesium.defined(activeShapePoints.value[cylinder.positionIndex])) {
      if (entity.polygon?.rectangle) {
        moveAdjacentRectangleCorners({ movedCornerIndex: cylinder.positionIndex });
      }
    }
  }
}

function onMouseMove(event) {
  if (!isDragging.value || povActive.value) return;

  const scene = mapCollection.getMap('3D').getCesiumScene();
  const posRay = scene.camera.getPickRay(event.endPosition);
  const position = scene.globe.pick(posRay, scene);
  const anchorRay = scene.camera.getPickRay(event.startPosition);
  const anchor = useAnchorMove.value ? scene.globe.pick(anchorRay, scene) : null;
  const entities = mapCollection.getMap('3D').getDataSourceDisplay().defaultDataSource.entities;
  const entity = entities.getById(currentModelId.value);

  if (!Cesium.defined(position) || !Cesium.defined(entity)) return;

  if (entity.polygon) {
    movePolygon({ entityId: currentModelId.value, position, anchor });
  } else if (entity.polyline) {
    movePolyline({ entityId: currentModelId.value, position, anchor });
  } else {
    const diff = Cesium.Cartesian3.subtract(position, anchor || entity?.position?.getValue() || position, new Cesium.Cartesian3());
    entity.position = Cesium.Cartesian3.add(entity.position?.getValue() || position, diff, new Cesium.Cartesian3());
  }
  updatePositionUI();
}

function onMouseUp() {
  if (!isDragging.value) return;

  const entities = mapCollection.getMap('3D').getDataSourceDisplay().defaultDataSource.entities;
  const scene = mapCollection.getMap('3D').getCesiumScene();
  const entity = entities.getById(currentModelId.value);

  eventHandler.value?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
  eventHandler.value?.setInputAction(cursorCheck, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  setIsDragging(false);

  if (importedEntities.value.length) {
    const importedEntity = importedEntities.value.find(importEntity => importEntity.entityId === currentModelId.value);
    if (importedEntity) {
      importedEntity.position = entity.position.getValue();
    }
  }

  if (cylinderId.value || wasDrawn.value) {
    setCylinderId(null);
  }

  if (originalHideOption.value) {
    setHideObjects(originalHideOption.value);
    eventHandler.value.setInputAction(selectObject, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
  setUseAnchorMove(true);
  document.getElementById('map').style.cursor = 'grab';
  setTimeout(() => {
    scene.screenSpaceCameraController.enableInputs = true;
  });
}

function catchUndoRedo(event) {
  if (isDrawing.value) return;

  if (event.ctrlKey && event.key === 'z' && originalPosition.value) {
    lastAction.value = 'undo';
    applyEntityMovement(originalPosition.value);
    originalPosition.value = null;
    event.preventDefault();
  } else if (event.ctrlKey && event.key === 'y' && undonePosition.value) {
    lastAction.value = 'redo';
    applyEntityMovement(undonePosition.value);
    undonePosition.value = null;
    event.preventDefault();
  }
}

async function applyEntityMovement(entityObject) {
  if (!entityObject) return;

  setCurrentModelId(entityObject.attachedEntityId || entityObject.entityId);
  await nextTick();

  const entities = mapCollection.getMap('3D').getDataSourceDisplay().defaultDataSource.entities;
  const movedEntity = entityObject.attachedEntityId
    ? entities.values.find(val => val.positionIndex === entityObject.entityId)
    : entities.getById(entityObject.entityId);

  if (!movedEntity) return;

  if (lastAction.value === 'undo') {
    undonePosition.value = {
      entityId: movedEntity.id,
      position: movedEntity.wasDrawn ? getCenterFromGeometry.value(movedEntity) : movedEntity.position.getValue()
    };
  } else if (lastAction.value === 'redo') {
    originalPosition.value = {
      entityId: movedEntity.id,
      position: movedEntity.wasDrawn ? getCenterFromGeometry.value(movedEntity) : movedEntity.position.getValue()
    };
  }

  if (movedEntity.cylinder) {
    const attachedEntity = entities.getById(entityObject.attachedEntityId);
    undonePosition.value.attachedEntityId = entityObject.attachedEntityId;

    activeShapePoints.value.splice(movedEntity.positionIndex, 1, entityObject.position);
    if (attachedEntity.polygon?.rectangle) {
      moveAdjacentRectangleCorners({ movedCornerIndex: movedEntity.positionIndex });
    }
  } else if (movedEntity.wasDrawn) {
    if (movedEntity.polygon) {
      movePolygon(entityObject);
    } else if (movedEntity.polyline) {
      movePolyline(entityObject);
    }
  } else {
    movedEntity.position = entityObject.position;
  }

  if (isDragging.value) {
    onMouseUp();
  }
}

function highlightEntity(entity) {
  const silhouetteColor = highlightStyle.value.silhouetteColor;
  const silhouetteSize = highlightStyle.value.silhouetteSize;

  if (entity.wasDrawn) {
    if (entity.polygon) {
      entity.polygon.outline = false;
      generateOutlines(entity);
    } else if (entity.polyline) {
      entity.originalWidth = entity.polyline.width;
      setLineWidth(entity.originalWidth);
      entity.originalColor = entity.polyline.material.color;
      entity.polyline.material.color = Cesium.Color.fromCssColorString(silhouetteColor);
      entity.polyline.width += 2;
    }
  } else {
    entity.model.silhouetteColor = Cesium.Color.fromCssColorString(silhouetteColor);
    entity.model.silhouetteSize = parseFloat(silhouetteSize);
    entity.model.colorBlendMode = Cesium.ColorBlendMode.HIGHLIGHT;
  }
}

function generateOutlines(entity) {
  const entities = mapCollection.getMap('3D').getDataSourceDisplay().defaultDataSource.entities;
  const positions = entity.polygon.hierarchy.getValue().positions;

  entities.add({
    outline: true,
    polyline: {
      width: 4,
      material: Cesium.Color.fromAlpha(
        Cesium.Color.fromCssColorString(highlightStyle.value.silhouetteColor),
        parseFloat(1)
      ),
      positions: new Cesium.CallbackProperty(() => {
        const extrudedPositions = positions.map((pos) => {
          const cartographic = Cesium.Cartographic.fromCartesian(pos);
          return Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height.value);
        });
        extrudedPositions.push(extrudedPositions[0]);
        return extrudedPositions;
      }, false)
    }
  });

  entities.add({
    outline: true,
    polyline: {
      width: 4,
      material: Cesium.Color.fromAlpha(
        Cesium.Color.fromCssColorString(highlightStyle.value.silhouetteColor),
        parseFloat(1)
      ),
      positions: new Cesium.CallbackProperty(() => {
        const extrudedPositions = positions.map((pos) => {
          const cartographic = Cesium.Cartographic.fromCartesian(pos);
          return Cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            extrudedHeight.value + height.value
          );
        });
        extrudedPositions.push(extrudedPositions[0]);
        return extrudedPositions;
      }, false)
    }
  });
}

function positionPovCamera() {
  const scene = mapCollection.getMap('3D').getCesiumScene();
  const transformedCoordinates = crs.transformFromMapProjection(
    mapCollection.getMap('3D').getOlMap(),
    'EPSG:4326',
    clickCoordinate.value
  );
  const currentPosCarto = scene.camera.positionCartographic;
  const destination = new Cesium.Cartographic(
    Cesium.Math.toRadians(transformedCoordinates[0]),
    Cesium.Math.toRadians(transformedCoordinates[1])
  );
  const entities = mapCollection.getMap('3D').getDataSourceDisplay().defaultDataSource.entities;
  const povCyl = entities.getById(cylinderId.value);

  originalCursorStyle.value = document.getElementById('map').style.cursor;
  currentCartesian.value = Cesium.Cartographic.toCartesian(currentPosCarto);
  destination.height = scene.sampleHeight(destination, [ povCyl ]) + 1.8;

  scene.camera.flyTo({
    destination: Cesium.Cartesian3.fromRadians(destination.longitude, destination.latitude, destination.height),
    orientation: { pitch: 0, roll: 0, heading: scene.camera.heading }
  });

  scene.screenSpaceCameraController.enableZoom = false;
  scene.screenSpaceCameraController.enableRotate = false;
  scene.screenSpaceCameraController.enableTilt = false;
  scene.screenSpaceCameraController.enableLook = true;
  scene.screenSpaceCameraController.lookEventTypes = Cesium.CameraEventType.LEFT_DRAG;

  preRenderListener.value = scene.preRender.addEventListener(() => {
    scene.camera.setView({
      orientation: {
        heading: scene.camera.heading,
        pitch: Cesium.Math.clamp(
          scene.camera.pitch,
          -Cesium.Math.PI_OVER_TWO + Cesium.Math.EPSILON1,
          Cesium.Math.PI_OVER_TWO - Cesium.Math.EPSILON1
        ),
        roll: 0
      }
    });
  });

  document.addEventListener('keydown', escapePedView);
}

function escapePedView(e) {
  if (typeof e !== 'undefined' && e.code !== 'Escape') return;

  const scene = mapCollection.getMap('3D').getCesiumScene();

  if (currentCartesian.value) {
    scene.camera.flyTo({
      destination: currentCartesian.value,
      complete: () => {
        scene.preRender.removeEventListener(preRenderListener.value);
        scene.screenSpaceCameraController.enableLook = false;
        scene.screenSpaceCameraController.enableTilt = true;
        scene.screenSpaceCameraController.enableZoom = true;
        scene.screenSpaceCameraController.enableRotate = true;

        eventHandler.value.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        document.removeEventListener('keydown', escapePedView);
        document.getElementById('map').style.cursor = originalCursorStyle.value;
        togglePovInteraction();
      }
    });
  }

  resetPov();
}

function resetPov() {
  const entities = mapCollection.getMap('3D').getDataSourceDisplay().defaultDataSource.entities;

  setPovActive(false);
  entities.removeById(cylinderId.value);
  document.getElementById('map').style.cursor = originalCursorStyle.value;
  eventHandler.value.setInputAction(selectObject, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  eventHandler.value.setInputAction(moveEntity, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  eventHandler.value.setInputAction(cursorCheck, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

function clickHandler() {
  document.getElementById('map').style.cursor = originalCursorStyle.value;
  eventHandler.value.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  eventHandler.value.setInputAction(selectObject, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  positionPovCamera();
}

function moveHandler() {
  if (!mouseCoordinate.value) return;

  const entities = mapCollection.getMap('3D').getDataSourceDisplay().defaultDataSource.entities;
  const transformedCoordinates = crs.transformFromMapProjection(
    mapCollection.getMap('3D').getOlMap(),
    'EPSG:4326',
    [ mouseCoordinate.value[0], mouseCoordinate.value[1] ]
  );
  const cartographic = Cesium.Cartographic.fromDegrees(transformedCoordinates[0], transformedCoordinates[1]);
  const povCyl = entities.getById(cylinderId.value);
  let currCart;

  if (cartographic) {
    const scene = mapCollection.getMap('3D').getCesiumScene();
    cartographic.height = scene.sampleHeight(cartographic, [ povCyl ]);
    currCart = Cesium.Cartographic.toCartesian(cartographic);
    document.getElementById('map').style.cursor = 'copy';
  }

  if (!Cesium.Cartesian3.equals(currentCartesian.value, currCart)) {
    currentCartesian.value = currCart;
  }
}

function togglePovInteraction() {
  if (!povActive.value) return;

  const entities = mapCollection.getMap('3D').getDataSourceDisplay().defaultDataSource.entities;
  let povCylinder = entities.getById(cylinderId.value);

  if (!povCylinder) {
    const payload = { posIndex: 0, length: 10 };
    createCylinder(payload);
    povCylinder = entities.getById(cylinderId.value);
    povCylinder.position = new Cesium.CallbackProperty(
      // eslint-disable-next-line no-undef
      () => adaptCylinderUnclamped(povCylinder, currentCartesian.value),
      false
    );
  }

  eventHandler.value.setInputAction(moveHandler, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  eventHandler.value.setInputAction(clickHandler, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

watch(currentModelId, (newId, oldId) => {
  if (!isDrawing.value) {
    const entities = mapCollection.getMap('3D').getDataSourceDisplay().defaultDataSource.entities;
    const newEntity = entities.getById(newId);
    const oldEntity = entities.getById(oldId);

    if (oldEntity) {
      resetOldEntity(oldEntity);
    }
    if (newEntity) {
      setupNewEntity(newEntity);
    }
  }
});

watch(movingEntity, (val) => {
  if (val) {
    moveEntity();
    setMovingEntity(!val);
  }
});

onMounted(() => {
  const scene = mapCollection.getMap('3D').getCesiumScene();

  initProjectionsInModeler3D(crs, projections.value, namedProjections.value, currentProjection.value);
  eventHandler.value = new Cesium.ScreenSpaceEventHandler(scene.canvas);

  eventHandler.value.setInputAction(selectObject, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  eventHandler.value.setInputAction(moveEntity, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  eventHandler.value.setInputAction(cursorCheck, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  document.addEventListener('keydown', catchUndoRedo);
});

onBeforeUnmount(() => {
  setCurrentModelId(null);
  eventHandler.value.destroy();
  document.removeEventListener('keydown', catchUndoRedo);
});
</script>

<!--<template>-->
<!--</template>-->
