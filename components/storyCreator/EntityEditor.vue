<script>
import {mapActions, mapGetters, mapMutations} from "vuex";


import actions from "../../store/actionsDataNarrator";
import * as constants from "../../store/constantsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import BackButton from "../shared/BackButton.vue";
import {getItemRecursive, replaceFileItem} from "../../utils/threeDFiles";

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
            threeDFiles: this.editedStep.threeDFiles || [],
            icons: {
                mdiChevronDown,
                mdiChevronUp
            },
            position: null,
            orientation: null,
            scale: 1,
            northing: 0,
            easting: 0,
            altitude: 0
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


        const currentItem = getItemRecursive(this.threeDFiles, this.selectedEntityId),
            newItems = replaceFileItem(this.threeDFiles, this.selectedEntityId, {
                ...currentItem,
                scale: this.scale,
                position: {
                    x: this.position._value.x,
                    y: this.position._value.y,
                    z: this.position._value.z
                }
                // orientation: {
                //     heading: simpleOrientationObject.heading,
                //     pitch: simpleOrientationObject.pitch,
                //     roll: simpleOrientationObject.roll
                // }
            }),
            wgs84Projection = "EPSG:4326",
            utm32UProjection = "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
            utmProjection = "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
            positionObject = new Cesium.Cartesian3(this.position._value.x, this.position._value.y, this.position._value.z),

            cartographic = Cesium.Cartographic.fromCartesian(positionObject),
            latitude = Cesium.Math.toDegrees(cartographic.latitude),
            longitude = Cesium.Math.toDegrees(cartographic.longitude),

            [easting, northing] = proj4(utm32UProjection).forward([longitude, latitude]);


        // this.updatePosition();

        console.log("MOUNT", this.position, this.position.height, cartographic, latitude, longitude, easting, northing);
        this.northing = northing;
        this.easting = easting;
        this.alittude = this.position.height;

        // this.altitude = this.position.height;
        // this.northing = northing;
        // this.easting = easting;


        this.threeDFiles = newItems;
        this.step.threeDFiles = this.threeDFiles;
        // console.log("mounted");
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

            const currentItem = getItemRecursive(this.threeDFiles, this.selectedEntityId),
                newItems = replaceFileItem(this.threeDFiles, this.selectedEntityId, {
                    ...currentItem,
                    scale: this.scale
                });


            this.threeDFiles = newItems;
            this.step.threeDFiles = this.threeDFiles;
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
                currentItem = getItemRecursive(this.threeDFiles, this.selectedEntityId),
                position = Cesium.Cartesian3.fromDegrees(geographicCoords[0], geographicCoords[1], geographicCoords[2]),
                newItems = replaceFileItem(this.threeDFiles, this.selectedEntityId, {
                    ...currentItem,
                    position: position
                });

            this.changeEntityLocation({
                entityId: this.selectedEntityId, newLocation: position
            });

            this.position = position;

            this.threeDFiles = newItems;
            this.step.threeDFiles = this.threeDFiles;
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
            :text="step.title"
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
