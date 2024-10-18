<script>
import {mdiChevronDown, mdiChevronUp, mdiTrashCanOutline} from "@mdi/js";
import sortBy from "../../../../../../src/shared/js/utils/sortBy";
import {mapGetters} from "vuex";

export default {
    name: "LayerSelectedPreview",
    props: {
        selectedLayers: {
            type: Array,
            required: true
        },
        selected: {
            type: Array,
            required: true
        }
    },
    data () {
        return {
            icons: {
                chevronUp: mdiChevronUp,
                chevronDown: mdiChevronDown,
                trash: mdiTrashCanOutline
            }
        };
    },
    computed: {
        ...mapGetters([
            "isMobile",
            "layerConfigsByAttributes"
        ])
    },
    methods: {
        deleteLayer (layer) {
            const tmpSelected = this.selected.filter(item => item.id !== layer.id);

            this.$emit("update:selected", tmpSelected);
        },
        moveLayer (layer, direction) {
            // sorted layers base on layer.get("selectionIDX")
            const sortedLayers = sortBy(this.selectedLayers, (model) => model.get("selectionIDX"), this),
                index = sortedLayers.findIndex(item => item.id === layer.id);

            if (!direction && index > 0) {
                // Move layer up
                const targetId = index - 1,
                    targetModel = this.layerConfigsByAttributes({id: sortedLayers[targetId].id}),


                    prevLayerSelectionIDX = layer.get("selectionIDX");

                layer.setSelectionIDX(targetModel.get("selectionIDX"));
                targetModel.setSelectionIDX(prevLayerSelectionIDX);
                layer.set("isSelected", true);
                targetModel.set("isSelected", true);
            }
            else if (direction && index < sortedLayers.length - 1) {
                // Move layer down
                const targetId = index + 1,
                    targetModel = this.layerConfigsByAttributes({id: sortedLayers[targetId].id}),

                    prevLayerSelectionIDX = layer.get("selectionIDX");

                layer.setSelectionIDX(targetModel.get("selectionIDX"));
                targetModel.setSelectionIDX(prevLayerSelectionIDX);
                layer.set("isSelected", true);
                targetModel.set("isSelected", true);
            }
            // Update the selection
            this.$emit("update:selected", sortBy(this.selectedLayers, (model) => model.get("selectionIDX"), this).map(item => ({
                id: item.id,
                transparency: 0,
                selectionIDX: item.get("selectionIDX")
            })));
        },
        changeTransparency (layer, value) {
            for (const l of this.selectedLayers) {
                if (l.id === layer.id) {
                    l.setTransparency(value);
                    l.setIsVisibleInMap(true);
                }
            }
            this.$emit("update:selected", sortBy(this.selectedLayers, (model) => model.get("selectionIDX"), this).map(item => ({
                id: item.id,
                transparency: item.id === layer.id ? value : item.get("transparency"),
                selectionIDX: item.get("selectionIDX")
            })));
        }
    }
};
</script>

<template>
    <div
        v-if="selectedLayers.length > 0"
        class="layer-box"
    >
        <v-row
            v-for="(item) in selectedLayers"
            :key="item.id"
            class="layer-row align-items-center"
        >
            <v-col cols="8">
                {{ item.attributes.name }}
            </v-col>
            <v-col
                class="justify-end"
                cols="4"
            >
                <v-row
                    class="align-items-center"
                >
                    <v-col
                        class="justify-end"
                        cols="3"
                        offset="3"
                    >
                        <v-icon
                            color="grey lighten-1"
                            small
                            @click="moveLayer(item, true)"
                        >
                            {{ icons.chevronUp }}
                        </v-icon>
                        <v-icon
                            color="grey lighten-1"
                            small
                            @click="moveLayer(item, false)"
                        >
                            {{ icons.chevronDown }}
                        </v-icon>
                    </v-col>
                    <v-col
                        align="right"
                        class="justify-end"
                        cols="4"
                    >
                        <v-text-field
                            v-model="item.attributes.transparency"
                            class="transparency-input"
                            hide-details
                            max="90"
                            min="0"
                            suffix="%"
                            type="number"
                            @change="changeTransparency(item, $event)"
                        />
                    </v-col>

                    <v-col
                        align="right"
                        cols="2"
                    >
                        <v-icon
                            color="grey lighten-1"
                            small
                            @click="deleteLayer(item)"
                        >
                            {{ icons.trash }}
                        </v-icon>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </div>
</template>

<style lang="scss" scoped>

.layer-box {
    width: 100%;
    border: 1px solid #ccc;
    padding: 2px 10px;
    margin: 10px 0;
    border-radius: 6px;

    button:deep {
        .v-icon__svg {
            color: rgba(0, 0, 0, .87) !important;
        }
    }
}

.layer-row {
    border: 0;
    height: 25px !important;
    margin: 0 !important;
    padding: 0;
}

.transparency-input:deep input[type="number"] {
    padding: 0;
    height: 20px;
}

.transparency-input {
    border: none;
    padding-top: 0;
    margin-top: 0;
    font-size: 10px;
    color: rgba(0, 0, 0, .57);
    width: 40px;

    .v-input__slot {
        height: 20px;

        .v-text-field__slot {
            height: 20px;
        }
    }
}
</style>
