<script setup>

import {computed, ref} from "vue";
import crs from "@masterportal/masterportalapi/src/crs";
import {useStore} from "vuex";
import EntityAttribute from "../../../../../../../../../../src/modules/modeler3D/components/ui/EntityAttribute.vue";

const store = useStore();

const eastingString = ref("0.00");
const northingString = ref("0.00");
const coordinateEasting = computed(() => store.getters["Modules/Modeler3D/coordinateEasting"]);
const coordinateNorthing = computed(() => store.getters["Modules/Modeler3D/coordinateNorthing"]);

const showPositioning = computed(() => {
    const map3D = mapCollection.getMap("3D");
    if (!map3D) return false;

    const entities = map3D.getDataSourceDisplay().defaultDataSource.entities;
    const currentModelId = store.getters["Modules/Modeler3D/currentModelId"];
    if (!currentModelId) return false;

    const entity = entities.getById(currentModelId);
    if (!entity) return false;

    return !!(entity.polygon || !entity.wasDrawn);
});

// Example stubs (replace with Vuex getters if needed)
const currentProjection = computed(
    () => store.getters["Modules/CoordToolkit/currentProjection"] ?? {}
);

const getLabel = (type) =>
    store.getters["Modules/CoordToolkit/getLabel"]
        ? store.getters["Modules/CoordToolkit/getLabel"](type)
        : type;

// --- coordinate edit helpers (use .value!) ---
const onEastingInput = (val) => {
    eastingString.value = String(val ?? "");
};

const onEastingChange = () => {
    const num = parseFloat((eastingString.value || "0").replace(",", "."));
    eastingString.value = isFinite(num) ? num.toFixed(2) : "0.00";
    updateCoords(eastingString.value, "east");
};

const onNorthingInput = (val) => {
    northingString.value = String(val ?? "");
};

const onNorthingChange = () => {
    const num = parseFloat((northingString.value || "0").replace(",", "."));
    northingString.value = isFinite(num) ? num.toFixed(2) : "0.00";
    updateCoords(northingString.value, "north");
};

function coordAdjusted({shift}) {
    return shift ? 10 : 1; // keep your step logic
}

const incEasting = (shift) => {
    const base = Number(coordinateEasting.value ?? 0);
    eastingString.value = prettyCoord(base + coordAdjusted({shift, coordType: "easting"}));
    updateCoords(eastingString.value, "east");
};

const decEasting = (shift) => {
    const base = Number(coordinateEasting.value ?? 0);
    eastingString.value = prettyCoord(base - coordAdjusted({shift, coordType: "easting"}));
    updateCoords(eastingString.value, "east");
};

const incNorthing = (shift) => {
    const base = Number(coordinateNorthing.value ?? 0);
    northingString.value = prettyCoord(base + coordAdjusted({shift, coordType: "northing"}));
    updateCoords(northingString.value, "north");
};

const decNorthing = (shift) => {
    const base = Number(coordinateNorthing.value ?? 0);
    northingString.value = prettyCoord(base - coordAdjusted({shift, coordType: "northing"}));
    updateCoords(northingString.value, "north");
};

function prettyCoord(value) {
    const n = Number(value);
    return isFinite(n) ? n.toFixed(2) : "0.00";
}

function updateCoords(_value, type) {
    const map3D = mapCollection.getMap("3D");
    if (!map3D) return;

    const scene = map3D.getCesiumScene();
    const entities = map3D.getDataSourceDisplay().defaultDataSource.entities;
    const currentModelId = store.getters["Modules/Modeler3D/currentModelId"];
    if (!currentModelId) return;

    const entity = entities.getById(currentModelId);
    if (!entity || !entity.position) return;

    // parse numbers from the UI fields
    const parseNum = (s) => {
        const n = parseFloat(String(s ?? "0").replace(",", "."));
        return Number.isFinite(n) ? n : 0;
    };
    const east = parseNum(eastingString.value);
    const north = parseNum(northingString.value);

    // Convert from the **current UI projection** -> WGS84
    const srcCrs = currentProjection.value?.id || "EPSG:4326"; // CoordToolkit’s selected CRS
    const [lonDeg, latDeg] = crs.transform([east, north], srcCrs, "EPSG:4326");

    // preserve the entity’s current altitude
    const now = Cesium.JulianDate.now();
    const curr = entity.position.getValue(now);
    const currCarto = curr
        ? Cesium.Cartographic.fromCartesian(curr)
        : new Cesium.Cartographic(
            Cesium.Math.toRadians(lonDeg),
            Cesium.Math.toRadians(latDeg),
            0
        );

    const next = Cesium.Cartesian3.fromDegrees(lonDeg, latDeg, currCarto.height);
    entity.position = next;

    scene.requestRender();
    try {
        store.dispatch("Modules/Modeler3D/updatePositionUI");
    } catch {
    }
}


</script>

<template>
    <div
        v-if="showPositioning"
        id="position"
    >
        <EntityAttribute
            id="easting"
            :value="eastingString"
            title="easting"
            :label="$t(getLabel('eastingLabel'))"
            :width-classes="['col', 'col-md']"
            :buttons="currentProjection.id !== 'http://www.opengis.net/gml/srs/epsg.xml#4326'"
            @input="onEastingInput"
            @change="onEastingChange"
            @increment="incEasting(false)"
            @increment-shift="incEasting(true)"
            @decrement="decEasting(false)"
            @decrement-shift="decEasting(true)"
        />
        <EntityAttribute
            id="northing"
            :value="northingString"
            title="northing"
            :label="$t(getLabel('northingLabel'))"
            :width-classes="['col', 'col-md']"
            :buttons="currentProjection.id !== 'http://www.opengis.net/gml/srs/epsg.xml#4326'"
            @input="onNorthingInput"
            @change="onNorthingChange"
            @increment="incNorthing(false)"
            @increment-shift="incNorthing(true)"
            @decrement="decNorthing(false)"
            @decrement-shift="decNorthing(true)"
        />
    </div>
</template>
