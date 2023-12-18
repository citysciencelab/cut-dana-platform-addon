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
        // set map to 3d
        if (this.selectedEntity) {
            this.position = this.selectedEntity.position;
            this.orientation = this.selectedEntity.orientation;
            this.scale = parseFloat(this.selectedEntity.model.scale);
        }

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
                    w: this.orientation._value.w,
                    x: this.orientation._value.x,
                    y: this.orientation._value.y,
                    z: this.orientation._value.z
                }
            }),
            utm32UProjection = "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
            positionObject = new Cesium.Cartesian3(this.position._value.x, this.position._value.y, this.position._value.z),

            cartographic = Cesium.Cartographic.fromCartesian(positionObject),
            latitude = Cesium.Math.toDegrees(cartographic.latitude),
            longitude = Cesium.Math.toDegrees(cartographic.longitude),

            [easting, northing] = proj4(utm32UProjection).forward([longitude, latitude]),

            hpr = Cesium.HeadingPitchRoll.fromQuaternion(this.orientation);

        // this.updatePosition();

        this.northing = northing;
        this.easting = easting;
        this.alittude = this.position.height;
        this.heading = Cesium.Math.toDegrees(hpr.heading);

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
                ...getEntityValues(modelId)
            }));
        },

        updateOrientation (heading, pitch, roll) {

            // eslint-disable-next-line radix
            const h = heading !== undefined ? Cesium.Math.toRadians(parseInt(heading)) : Cesium.Math.toRadians(parseInt(this.heading)),
                // eslint-disable-next-line radix
                p = pitch !== undefined ? Cesium.Math.toRadians(parseInt(pitch)) : Cesium.Math.toRadians(parseInt(this.pitch)),
                // eslint-disable-next-line radix
                r = roll !== undefined ? Cesium.Math.toRadians(parseInt(roll)) : Cesium.Math.toRadians(parseInt(this.roll)),

                hpr = new Cesium.HeadingPitchRoll(h, p, r),

                orientation = Cesium.Transforms.headingPitchRollQuaternion(this.position.getValue(Cesium.JulianDate.now()), hpr);

            this.changeEntityOrientation({
                entityId: this.selectedEntityId, newOrientation: orientation
            });

            this.orientation = orientation;

            this.step.selectedModelIds = this.step.selectedModelIds.map(({modelId}) =>({
                modelId,
                ...getEntityValues(modelId)
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
                                @input="updateScale"
                            />
                        </v-col>
                    </v-row>
                </v-container>
                <v-container>
                    <v-row>
                        <v-col cols="auto">
                            <v-text-field
                                v-model="northing"
                                label="Northing"
                                type="number"
                                outlined
                                @change="(value) => updatePosition()"
                            />
                        </v-col>
                        <v-col cols="auto">
                            <v-row>
                                <v-btn
                                    icon
                                    small
                                    @click="incrementNorhting"
                                >
                                    <v-icon>{{ icons.mdiChevronUp }}</v-icon>
                                </v-btn>
                            </v-row>
                            <v-row>
                                <v-btn
                                    icon
                                    small
                                    @click="decrementNorhting"
                                >
                                    <v-icon>{{ icons.mdiChevronDown }}</v-icon>
                                </v-btn>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-container>
                <v-container>
                    <v-row>
                        <v-col cols="auto">
                            <v-text-field
                                v-model="easting"
                                label="Easting"
                                type="number"
                                outlined
                                @change="(value) => updatePosition()"
                            />
                        </v-col>
                        <v-col cols="auto">
                            <v-row>
                                <v-btn
                                    icon
                                    small
                                    @click="incrementEasting"
                                >
                                    <v-icon>{{ icons.mdiChevronUp }}</v-icon>
                                </v-btn>
                            </v-row>
                            <v-row>
                                <v-btn
                                    icon
                                    small
                                    @click="decrementEasting"
                                >
                                    <v-icon>{{ icons.mdiChevronDown }}</v-icon>
                                </v-btn>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-container>
                <v-container>
                    <v-row>
                        <v-col cols="auto">
                            <v-text-field
                                v-model="heading"
                                label="Heading"
                                type="number"
                                outlined
                                @change="(value) => updateOrientation()"
                            />
                        </v-col>
                        <v-col cols="auto">
                            <v-row>
                                <v-btn
                                    icon
                                    small
                                    @click="incrementHeading"
                                >
                                    <v-icon>{{ icons.mdiChevronUp }}</v-icon>
                                </v-btn>
                            </v-row>
                            <v-row>
                                <v-btn
                                    icon
                                    small
                                    @click="decrementHeading"
                                >
                                    <v-icon>{{ icons.mdiChevronDown }}</v-icon>
                                </v-btn>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-container>
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
