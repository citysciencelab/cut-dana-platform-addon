<script setup>
import {ref, computed, watch} from "vue";
import {useStore} from "vuex";
import {mdiCubeScan} from "@mdi/js";

import EntityList from "./EntityList.vue";
import Modeler3D from "./Modeler3D.vue";
import Modeler3DEntityModel
    from "../../../../../../../../../../src/modules/modeler3D/components/Modeler3DEntityModel.vue";

const props = defineProps({
    modelValue: {
        type: Object,
        required: true,
    }
});

const emit = defineEmits(["update:modelValue"]);

const store = useStore();
const fileLoading = ref(false);

const importedModels = computed(() => store.getters["Modules/Modeler3D/importedModels"]);
const coordinateEasting = computed(() => store.getters["Modules/Modeler3D/coordinateEasting"]);
const coordinateNorthing = computed(() => store.getters["Modules/Modeler3D/coordinateNorthing"]);
const height = computed(() => store.getters["Modules/Modeler3D/height"]);
const scale = computed(() => store.getters["Modules/Modeler3D/scale"]);
const rotation = computed(() => store.getters["Modules/Modeler3D/rotation"]);
const adaptToHeight = computed(() => store.getters["Modules/Modeler3D/adaptToHeight"]);

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

watch([
    coordinateEasting,
    coordinateNorthing,
    height,
    scale,
    rotation,
    adaptToHeight
], ([ce, cn, h, s, r, ah]) => {
    const prev = props.modelValue ?? {};

    const next = {
        coordinates: {
            easting: ce ?? prev?.coordinates?.easting ?? null,
            northing: cn ?? prev?.coordinates?.northing ?? null,
        },
        dimensions: {
            height: h ?? prev?.dimensions?.height ?? 0,
            adaptToTerrain: !!(ah ?? prev?.dimensions?.adaptToTerrain ?? true),
        },
        transforms: {
            rotation: r ?? prev?.transforms?.rotation ?? 0,
            scale: s ?? prev?.transforms?.scale ?? 1,
        },
    };

    emit("update:modelValue", next);
}, {immediate: true});
</script>

<template>
    <div class="mb-2">
        <v-file-input
            variant="outlined"
            label="Upload model (.glb, .gltf)"
            accept=".glb,.gltf"
            show-size
            :prepend-icon="mdiCubeScan"
            @update:modelValue="onFileChange"
        />

        <EntityList/>

        <div class="mt-2">
            <Modeler3DEntityModel v-if="importedModels.length > 0"/>
        </div>
    </div>

    <Modeler3D/>
</template>
