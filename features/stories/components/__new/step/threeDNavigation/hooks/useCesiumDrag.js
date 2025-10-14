import {onBeforeUnmount} from "vue";

export default function useCesiumModelDrag({
   threeDEnabled,
   onPositionChanged,
   mapId = "3D",
   mapElementId = "map",
   preserveGroundOffset = true,
   debug = false,
} = {}) {
    let scene = null;
    let handler = null;

    let dragging = false;
    let draggedEntity = null;

    let startEntityPos = null;
    let startGroundPos = null;
    let startGroundHeight = 0;
    let startEntityHeight = 0;
    let heightOffset = 0;

    const log = (...a) => debug && console.log("[useCesiumModelDrag]", ...a);

    function getScene() {
        if (!scene) {
            const map = mapCollection.getMap(mapId);
            if (!map) throw new Error(`Map '${mapId}' not found`);
            scene = map.getCesiumScene();
        }
        return scene;
    }

    function pickModelEntity(windowPosition) {
        const sc = getScene();
        const picked = sc.drillPick(windowPosition).filter(p => !p?.id?.label && !p?.id?.outline);
        const id = Cesium.defaultValue(picked[0]?.id, picked[0]?.primitive?.id);
        return id instanceof Cesium.Entity && id.model ? id : null;
    }

    function pickOnGlobe(windowPosition) {
        const sc = getScene();
        if (sc.pickPositionSupported) {
            const prev = sc.globe.depthTestAgainstTerrain;
            sc.globe.depthTestAgainstTerrain = true;
            const cart = sc.pickPosition(windowPosition);
            sc.globe.depthTestAgainstTerrain = prev;
            if (Cesium.defined(cart)) return cart;
        }
        const ray = sc.camera.getPickRay(windowPosition);
        return sc.globe.pick(ray, sc) || null;
    }

    function sampleGroundHeightAt(cartesian) {
        const sc = getScene();
        const carto = Cesium.Cartographic.fromCartesian(cartesian);
        const h = sc.sampleHeight(carto) ?? carto.height; // fallback if no terrain
        return {carto, height: h};
    }

    function mount() {
        const sc = getScene();
        handler = new Cesium.ScreenSpaceEventHandler(sc.canvas);

        handler.setInputAction((evt) => {
            if (!threeDEnabled?.value) return;

            const entity = pickModelEntity(evt.position);
            if (!entity) return;

            const ground = pickOnGlobe(evt.position);
            if (!Cesium.defined(ground)) return;

            const now = Cesium.JulianDate.now();
            const entityPosNow = entity.position?.getValue(now) || ground;

            startEntityPos = Cesium.Cartesian3.clone(entityPosNow);
            startGroundPos = Cesium.Cartesian3.clone(ground);

            const {carto: startEntityCarto} = sampleGroundHeightAt(startEntityPos);
            const {height: gH} = sampleGroundHeightAt(startGroundPos);
            startEntityHeight = startEntityCarto.height;
            startGroundHeight = gH;
            heightOffset = startEntityHeight - startGroundHeight;

            draggedEntity = entity;
            dragging = true;

            sc.screenSpaceCameraController.enableInputs = false;
            const el = document.getElementById(mapElementId);
            if (el) el.style.cursor = "grabbing";

            log("drag start", {id: entity.id, startEntityHeight, startGroundHeight, heightOffset});
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        handler.setInputAction((evt) => {
            if (!threeDEnabled?.value) return;

            const el = document.getElementById(mapElementId);

            if (dragging && draggedEntity && startEntityPos && startGroundPos) {
                const newGround = pickOnGlobe(evt.endPosition);
                if (!Cesium.defined(newGround)) return;

                const delta = Cesium.Cartesian3.subtract(newGround, startGroundPos, new Cesium.Cartesian3());
                const nextCartesian = Cesium.Cartesian3.add(startEntityPos, delta, new Cesium.Cartesian3());

                if (preserveGroundOffset) {
                    const {carto: newGroundCarto, height: newGroundH} = sampleGroundHeightAt(newGround);
                    const finalH = (newGroundH ?? newGroundCarto.height) + heightOffset;
                    const {longitude, latitude} = newGroundCarto;
                    draggedEntity.position = Cesium.Cartesian3.fromRadians(longitude, latitude, finalH);
                } else {
                    draggedEntity.position = nextCartesian;
                }

                if (typeof onPositionChanged === "function") {
                    const now = Cesium.JulianDate.now();
                    const pos = draggedEntity.position?.getValue(now);
                    onPositionChanged(draggedEntity.id, pos || draggedEntity.position);
                }

                sc.requestRender();
            } else {
                const entity = pickModelEntity(evt.endPosition);
                if (el) el.style.cursor = entity ? "grab" : "auto";
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        handler.setInputAction(() => {
            if (!dragging) return;

            dragging = false;
            draggedEntity = null;
            startEntityPos = null;
            startGroundPos = null;

            sc.screenSpaceCameraController.enableInputs = true;
            const el = document.getElementById(mapElementId);
            if (el) el.style.cursor = "grab";

            log("drag end");
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
    }

    function unmount() {
        try {
            const sc = getScene();
            if (handler) {
                handler.destroy();
                handler = null;
            }
            sc.screenSpaceCameraController.enableInputs = true;
        } catch {
        }
        const el = document.getElementById(mapElementId);
        if (el) el.style.cursor = "auto";
    }

    onBeforeUnmount(unmount);

    return {mount, unmount};
}
