<script>
import {mapActions, mapGetters, mapMutations} from "vuex";


import actions from "../../store/actionsDataNarrator";
import * as constants from "../../store/constantsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import BackButton from "../shared/BackButton.vue";
import {getItemRecursive, replaceFileItem} from "../../utils/threeDFiles";

import {mdiChevronUp, mdiChevronDown} from "@mdi/js";


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
            number: 0
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),
        ...mapGetters(["namedProjections"]),
        ...mapGetters("Maps", ["altitude", "longitude", "latitude", "clickCoordinate", "mouseCoordinate"]),
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

        console.log(this.selectedEntity.position._value, this.selectedEntity.orientation, this.selectedEntity.model.scale);


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
            });

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

        addValue () {
            this.number += 0.1;
            // Fix potential floating point precision issue
            this.number = parseFloat(this.number.toFixed(1));
        },
        subtractValue () {
            this.number -= 0.1;
            // Fix potential floating point precision issue
            this.number = parseFloat(this.number.toFixed(1));
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
                                v-model="number"
                                label="Number"
                                type="number"
                                outlined
                            />
                        </v-col>
                        <v-col cols="auto">
                            <v-row>
                                <v-btn
                                    icon
                                    small
                                    @click="addValue"
                                >
                                    <v-icon>{{ icons.mdiChevronUp }}</v-icon>
                                </v-btn>
                            </v-row>
                            <v-row>
                                <v-btn
                                    icon
                                    small
                                    @click="subtractValue"
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
