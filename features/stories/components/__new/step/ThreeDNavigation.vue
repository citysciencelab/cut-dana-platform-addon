<script setup lang="js">
import {reactive, computed, watch, nextTick, ref, onMounted} from "vue";
import {useStore} from "vuex";
import {mdiCubeScan} from "@mdi/js";

const store = useStore();
const threeDEnabled = ref(false);
const fileLoading = ref(false);

const importedModels = computed(() => store.getters["Modules/Modeler3D/importedModels"]);

watch(threeDEnabled, (is3DEnabled) => {
    store.dispatch("Maps/changeMapMode", is3DEnabled ? "3D" : "2D");
}, {immediate: true});

async function handleGltfFile(blob, fileName) {
    const position = getCenterOfView3D();
    await store.dispatch("Modules/Modeler3D/createEntity", {
        blob: blob,
        fileName: fileName,
        position: position.cartesian,
    });
}

function getCenterOfView3D() {
    const scene = mapCollection.getMap("3D").getCesiumScene();
    const camera = scene.camera;
    const canvas = scene.canvas;

    // screen center in pixels
    const centerPx = new Cesium.Cartesian2(
        Math.round(canvas.clientWidth / 2),
        Math.round(canvas.clientHeight / 2)
    );

    // Try a precise pick against depth buffer (works for terrain/3D tiles, needs support)
    let cartesian = undefined;
    if (scene.pickPositionSupported) {
        // improves picking through terrain/tiles
        const prev = scene.globe.depthTestAgainstTerrain;
        scene.globe.depthTestAgainstTerrain = true;
        cartesian = scene.pickPosition(centerPx);
        scene.globe.depthTestAgainstTerrain = prev;
    }

    // Fallback: ray cast to the globe (works when looking at terrain/globe)
    if (!Cesium.defined(cartesian)) {
        const ray = camera.getPickRay(centerPx);
        cartesian = scene.globe.pick(ray, scene);
    }

    if (!Cesium.defined(cartesian)) {
        // If the camera points to the sky, there’s no intersection.
        // As a last resort, use the camera position (not the ground) or return null.
        const {x, y, z} = camera.positionWC;
        return {
            cartesian: {x, y, z},
            cartographic: null
        };
    }

    const carto = Cesium.Cartographic.fromCartesian(cartesian);
    return {
        cartesian: {x: cartesian.x, y: cartesian.y, z: cartesian.z},
        cartographic: {
            lon: Cesium.Math.toDegrees(carto.longitude),
            lat: Cesium.Math.toDegrees(carto.latitude),
            height: carto.height
        }
    };
}

function onFileChange(file) {
    const reader = new FileReader(),
        fileName = file.name.split(".")[0],
        fileExtension = file.name.split(".").pop();

    fileLoading.value = true;

    if (fileExtension === "gltf" || fileExtension === "glb") {
        handleGltfFile(file, fileName);
        return;
    }

    reader.onload = () => {
        fileLoading.value = false;
    };

    reader.onerror = (e) => {
        console.error("Error reading the file:", e.target.error);
        fileLoading.value = false;
    };

    reader.readAsText(file);
}

function zoomTo(id) {
    const scene = mapCollection.getMap("3D").getCesiumScene(),
        entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
        entity = entities.getById(id),
        entityPosition = entity.position.getValue(),
        destination = Cesium.Cartographic.fromCartesian(entityPosition);

    scene.camera.flyTo({
        destination: Cesium.Cartesian3.fromRadians(destination.longitude, destination.latitude, destination.height + 250)
    });
}
</script>

<template>
    <div>
        <div class="mb-2">
            3D Navigation
        </div>
        <div class="mb-2">
            <v-switch
                v-model="threeDEnabled"
                hide-details
                inset
                label="Enable 3D for this step"
            />
        </div>

        <div v-if="threeDEnabled" class="mb-2">
            <v-file-input
                variant="outlined"
                label="Upload model (.glb, .gltf)"
                accept=".glb,.gltf"
                show-size
                :prepend-icon="mdiCubeScan"
                @update:modelValue="onFileChange"
            />

            <div v-for="model in importedModels">
                <div @click="zoomTo(model.id)">{{ model.name }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
</style>
