<script>
import {mapActions, mapGetters, mapMutations} from "vuex";


import actions from "../../store/actionsDataNarrator";
import * as constants from "../../store/constantsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import BackButton from "../shared/BackButton.vue";
import {getItemRecursive, replaceFileItem} from "../../utils/threeDFiles";
import getEntityValues from "../../utils/getEntityValues";

import {mdiChevronUp, mdiChevronDown} from "@mdi/js";
import proj4 from "proj4";

proj4.defs("EPSG:32632", "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs");


export default {
    name: "EntityEditor",

    components: {
        BackButton
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
            step: this.editedStep,
            icons: {
                mdiChevronDown,
                mdiChevronUp
            },
            position: null,
            orientation: null,
            scale: 1,
            northing: 0,
            easting: 0,
            altitude: 0,
            heading: 0,
            pitch: 0,
            roll: 0
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),
        ...mapGetters(["namedProjections"]),
        ...mapGetters("Maps", ["clickCoordinate", "mouseCoordinate"]),
        selectedEntity () {
            return mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities.getById(this.selectedEntityId);
        }
    },
    watch: {

    },
    mounted () {
        console.log(this.selectedEntity);
        // set map to 3d
        if (this.selectedEntity) {
            this.position = this.selectedEntity.position;
            this.orientation = this.selectedEntity.orientation;
            this.scale = parseFloat(this.selectedEntity.model.scale);
        }

        console.log("HERE", this.orientation);

        const currentItem = getItemRecursive(this.step.selectedModelIds, this.selectedEntityId),
            newItems = replaceFileItem(this.step.selectedModelIds, this.selectedEntityId, {
                ...currentItem,
                scale: this.scale,
                position: {
                    x: this.position._value.x,
                    y: this.position._value.y,
                    z: this.position._value.z
                },
                orientation: {
                    heading: this.heading,
                    pitch: this.pitch,
                    roll: this.roll
                }
            }),
            utm32UProjection = "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
            positionObject = new Cesium.Cartesian3(this.position._value.x, this.position._value.y, this.position._value.z),

            cartographic = Cesium.Cartographic.fromCartesian(positionObject),
            latitude = Cesium.Math.toDegrees(cartographic.latitude),
            longitude = Cesium.Math.toDegrees(cartographic.longitude),

            [easting, northing] = proj4(utm32UProjection).forward([longitude, latitude]),


            hpr = Cesium.HeadingPitchRoll.fromQuaternion(this.orientation),

            // this.updatePosition();
            tempHeading = Cesium.Math.toDegrees(hpr.heading);


        console.log(hpr, tempHeading);

        this.northing = northing;
        this.easting = easting;
        this.alittude = this.position.height;
        this.heading = tempHeading ? tempHeading : 0;

        // this.altitude = this.position.height;
        // this.northing = northing;
        // this.easting = easting;


        this.threeDFiles = newItems;
        this.step.selectedModelIds = this.step.selectedModelIds.map(({modelId}) =>({
            modelId,
            ...getEntityValues(modelId)
        }));
    },
    beforeDestroy () {
        // console.log("beforeDestroy");
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),
        ...mapMutations("Tools/Gfi", {setGfiActive: "setActive"}),

        updateScale () {
            this.scaleEntity({entityId: this.selectedEntityId, scale: this.scale});

            // console.log(this.threeDFiles, this.selectedEntityId);

            this.step.selectedModelIds = this.step.selectedModelIds.map(({modelId}) =>({
                modelId,
                ...getEntityValues(modelId)
            }));
        },

        updatePosition (easting, northing, altitude) {
            let e, n, a;

            if (!easting) {
                e = parseFloat(this.easting);
            }
            else {
                e = parseFloat(easting);
            }

            if (!northing) {
                n = parseFloat(this.northing);
            }
            else {
                n = parseFloat(northing);
            }

            if (!altitude) {
                a = parseFloat(this.altitude);
            }
            else {
                a = parseFloat(altitude);
            }

            // Define the UTM Zone 32 projection
            proj4.defs("EPSG:32632", "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs");

            // Correct the order of the projections and include the altitude in the conversion
            const
                utm32UProjection = "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
                geographicCoords = proj4(utm32UProjection).inverse([e, n, a]),
                position = Cesium.Cartesian3.fromDegrees(geographicCoords[0], geographicCoords[1], geographicCoords[2]);


            this.changeEntityLocation({
                entityId: this.selectedEntityId, newLocation: position
            });

            this.position = position;

            this.step.selectedModelIds = this.step.selectedModelIds.map(({modelId}) =>({
                modelId,
                ...getEntityValues(modelId),
                orientation: {
                    heading: this.heading,
                    pitch: this.pitch,
                    roll: this.roll
                }
            }));
        },

        updateOrientation (heading, pitch, roll) {

            // eslint-disable-next-line radix
            const h = heading !== undefined ? Cesium.Math.toRadians(parseFloat(heading)) : Cesium.Math.toRadians(parseFloat(this.heading) * 1.0),
                // eslint-disable-next-line radix
                p = pitch !== undefined ? Cesium.Math.toRadians(parseFloat(pitch)) : Cesium.Math.toRadians(parseFloat(this.pitch) * 1.0),
                // eslint-disable-next-line radix
                r = roll !== undefined ? Cesium.Math.toRadians(parseFloat(roll)) : Cesium.Math.toRadians(parseFloat(this.roll) * 1.0),
                hpr = new Cesium.HeadingPitchRoll(h, p, r);

            let orientation;

            if (this.position instanceof Cesium.Cartesian3) {
                orientation = Cesium.Transforms.headingPitchRollQuaternion(this.position, hpr);
            }
            else {
                orientation = Cesium.Transforms.headingPitchRollQuaternion(new Cesium.Cartesian3(this.position._value.x, this.position._value.y, this.position._value.z), hpr);
            }


            this.changeEntityOrientation({
                entityId: this.selectedEntityId, newOrientation: orientation
            });

            this.orientation = orientation;

            this.step.selectedModelIds = this.step.selectedModelIds.map(({modelId}) =>({
                modelId,
                ...getEntityValues(modelId),
                orientation: {
                    heading: this.heading,
                    pitch: this.pitch,
                    roll: this.roll
                }
            }));
        },

        incrementNorhting () {
            this.northing += 0.1;
            // Fix potential floating point precision issue
            this.northing = parseFloat(this.northing.toFixed(1));

            this.updatePosition();
        },

        decrementNorhting () {
            this.northing -= 0.1;
            // Fix potential floating point precision issue
            this.northing = parseFloat(this.northing.toFixed(1));

            this.updatePosition();
        },

        incrementEasting () {
            this.easting += 0.1;
            // Fix potential floating point precision issue
            this.easting = parseFloat(this.easting.toFixed(1));

            this.updatePosition();
        },

        decrementEasting () {
            this.easting -= 0.1;
            // Fix potential floating point precision issue
            this.easting = parseFloat(this.easting.toFixed(1));

            this.updatePosition();
        },

        incrementHeading () {
            this.heading += 1;
            // Fix potential floating point precision issue

            // eslint-disable-next-line radix
            this.heading = parseInt(this.heading);

            this.updateOrientation();
        },

        decrementHeading () {
            this.heading -= 1;
            // Fix potential floating point precision issue


            // eslint-disable-next-line radix
            this.heading = parseInt(this.heading);

            this.updateOrientation();
        }
    }
};
</script>

<template lang="html">
    <div
        id="tool-dataNarrator-creator-entityEditor"
        class="mb-8"
    >
        <BackButton
            tooltip="additional:modules.tools.dataNarrator.button.backToStory"
            @click="$emit('return', step)"
        />
        <div
            v-if="loading"
        >
            loading...
        </div>
        <div v-else>
            <div>
                <v-container fluid>
                    <v-row>
                        <v-col cols="12">
                            <v-slider
                                v-model="scale"
                                label="Scale"
                                :max="2"
                                :min="0"
                                step="0.1"
                                track-color="primary-50"
                                @input="updateScale"
                            />
                        </v-col>
                    </v-row>
                </v-container>
                <v-container>
                    <v-row>
                        <v-col cols="10">
                            <input
                                v-model="northing"
                                class="form-control"
                                label="Northing"
                                type="number"
                                outlined
                                @change="(value) => updatePosition()"
                            >
                        </v-col>
                        <v-col cols="2">
                            <div class="input-group d-flex justify-content-center">
                                <v-tooltip top>
                                    <template #activator="{ on }">
                                        <v-icon
                                            class="ml-2 mr-1"
                                            v-on="on"
                                            @click="incrementNorhting"
                                        >
                                            {{ icons.mdiChevronUp }}
                                        </v-icon>
                                    </template>
                                    <span>
                                        {{ $t("additional:modules.tools.dataNarrator.label.zoomLevel") }}
                                    </span>
                                </v-tooltip>
                                <v-tooltip top>
                                    <template #activator="{ on }">
                                        <v-icon
                                            class="ml-2 mr-1"
                                            v-on="on"
                                            @click="decrementNorhting"
                                        >
                                            {{ icons.mdiChevronDown }}
                                        </v-icon>
                                    </template>
                                    <span>
                                        {{ $t("additional:modules.tools.dataNarrator.label.zoomLevel") }}
                                    </span>
                                </v-tooltip>
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
                <v-container>
                    <v-row>
                        <v-col cols="10">
                            <input
                                v-model="easting"
                                class="form-control"
                                label="Easting"
                                type="number"
                                outlined
                                @change="(value) => updatePosition()"
                            >
                        </v-col>
                        <v-col cols="2">
                            <div class="input-group d-flex justify-content-center">
                                <v-tooltip top>
                                    <template #activator="{ on }">
                                        <v-icon
                                            class="ml-2 mr-1"
                                            v-on="on"
                                            @click="incrementEasting"
                                        >
                                            {{ icons.mdiChevronUp }}
                                        </v-icon>
                                    </template>
                                    <span>
                                        {{ $t("additional:modules.tools.dataNarrator.label.zoomLevel") }}
                                    </span>
                                </v-tooltip>
                                <v-tooltip top>
                                    <template #activator="{ on }">
                                        <v-icon
                                            class="ml-2 mr-1"
                                            v-on="on"
                                            @click="decrementEasting"
                                        >
                                            {{ icons.mdiChevronDown }}
                                        </v-icon>
                                    </template>
                                    <span>
                                        {{ $t("additional:modules.tools.dataNarrator.label.zoomLevel") }}
                                    </span>
                                </v-tooltip>
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
                <v-container>
                    <v-row>
                        <v-col cols="10">
                            <input
                                v-model="heading"
                                class="form-control"
                                label="Heading"
                                type="number"
                                outlined
                                @change="(value) => updateOrientation()"
                            >
                        </v-col>
                        <v-col cols="2">
                            <div class="input-group d-flex justify-content-center">
                                <v-tooltip top>
                                    <template #activator="{ on }">
                                        <v-icon
                                            class="ml-2 mr-1"
                                            v-on="on"
                                            @click="incrementHeading"
                                        >
                                            {{ icons.mdiChevronUp }}
                                        </v-icon>
                                    </template>
                                    <span>
                                        {{ $t("additional:modules.tools.dataNarrator.label.zoomLevel") }}
                                    </span>
                                </v-tooltip>
                                <v-tooltip top>
                                    <template #activator="{ on }">
                                        <v-icon
                                            class="ml-2 mr-1"
                                            v-on="on"
                                            @click="decrementHeading"
                                        >
                                            {{ icons.mdiChevronDown }}
                                        </v-icon>
                                    </template>
                                    <span>
                                        {{ $t("additional:modules.tools.dataNarrator.label.zoomLevel") }}
                                    </span>
                                </v-tooltip>
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
            </div>
        </div>
    </div>
    </div>
</template>

<style lang="scss" scoped>

#tool-dataNarrator-creator-entityEditor {
    max-width: 460px;
    position: relatieve;

}
</style>
