<script>
import {mdiChevronDown, mdiChevronUp, mdiTrashCanOutline} from "@mdi/js";
import sortBy from "../../../../../../src/utils/sortBy";
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
                    targetModel = Radio.request("ModelList", "getModelByAttributes", {id: sortedLayers[targetId].id}),

                    prevLayerSelectionIDX = layer.get("selectionIDX");

                layer.setSelectionIDX(targetModel.get("selectionIDX"));
                targetModel.setSelectionIDX(prevLayerSelectionIDX);
                layer.set("isSelected", true);
                targetModel.set("isSelected", true);
            }
            else if (direction && index < sortedLayers.length - 1) {
                // Move layer down
                const targetId = index + 1,
                    targetModel = Radio.request("ModelList", "getModelByAttributes", {id: sortedLayers[targetId].id}),

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
                cols="4"
                class="justify-end"
            >
                <v-row
                    class="align-items-center"
                >
                    <v-col
                        cols="3"
                        offset="3"
                        class="justify-end"
                    >
                        <v-icon
                            small
                            color="grey lighten-1"
                            @click="moveLayer(item, true)"
                        >
                            {{ icons.chevronUp }}
                        </v-icon>
                        <v-icon
                            small
                            color="grey lighten-1"
                            @click="moveLayer(item, false)"
                        >
                            {{ icons.chevronDown }}
                        </v-icon>
                    </v-col>
                    <v-col
                        cols="4"
                        class="justify-end"
                        align="right"
                    >
                        <v-text-field
                            v-model="item.attributes.transparency"
                            type="number"
                            min="0"
                            max="90"
                            class="transparency-input"
                            suffix="%"
                            hide-details
                            @change="changeTransparency(item, $event)"
                        />
                    </v-col>

                    <v-col
                        cols="2"
                        align="right"
                    >
                        <v-icon
                            small
                            color="grey lighten-1"
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

<style scoped lang="scss">

.layer-box {
    width: 100%;
    border: 1px solid #ccc;
    padding: 2px 10px;
    margin: 10px 0;
    border-radius: 6px;

    button::v-deep {
        .v-icon__svg {
            color: rgba(0,0,0,.87) !important;
        }
    }
}
.layer-row {
    border: 0;
    height: 25px !important;
    margin: 0 !important;
    padding: 0;
}

.transparency-input::v-deep input[type="number"] {
    padding: 0;
    height: 20px;
}

.transparency-input {
    border: none;
    padding-top: 0;
    margin-top: 0;
    font-size: 10px;
    color: rgba(0,0,0,.57);
    width: 40px;

    .v-input__slot {
        height: 20px;
        .v-text-field__slot {
            height: 20px;
        }
    }
}
</style>
