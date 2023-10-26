<script>
// import draggable from "vuedraggable";
import {mdiChevronDown, mdiChevronUp, mdiClose} from "@mdi/js";
import sortBy from "../../../../../src/utils/sortBy";
export default {
    name: "LayerSelector",

    props: {
        items: {
            type: Array,
            default: () => []
        },
        selected: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {
            icons: {
                chevronUp: mdiChevronUp,
                chevronDown: mdiChevronDown,
                close: mdiClose
            }
        };
    },
    computed: {

        propModel: {
            get () {
                return this.selected.map(item => item.id);
            },
            set (value) {
                const
                // Filter the original items based on the selected IDs
                    selectedItems = value.map(layer => Radio.request("Parser", "getItemByAttributes", {id: layer}));

                this.$emit("update:selected", selectedItems.map((layer, index) => ({
                    id: layer.id,
                    transparency: 20,
                    selectionIDX: index + 10
                })));
            }
        },
        // console.log all the props
        // ...mapGetters("Tools/DataNarrator", Object.keys(getters))
        transformedItems () {
            let id = 0;
            const categories = {};

            /**
             * Create a new category
             * @param {array} categoryArr - The array of categories
             * @param {object} parentObj - The parent object
             * @param {number} depth - The depth of the category
             * @returns {void}
             */
            function createCategory (categoryArr, parentObj = {}, depth = 0) {
                if (categoryArr.length === 0) {
                    return;
                }

                const category = categoryArr.shift();

                if (!parentObj[category.camel]) {

                    id++;
                    parentObj[category.camel] = {
                        isCategory: true,
                        id: `CUSTOMCATEGORY${id.toString()}`,
                        name: category.original,
                        disabled: depth === 0,
                        children: {}
                    };

                }

                createCategory(categoryArr, parentObj[category.camel].children, depth + 1);
            }

            /**
             * Camelize a string
             * @param {string} str - The string to camelize
             * @returns {string} - The camelize string
             */
            function camelize (str) {
                return str.replace(/[^a-zA-Z0-9 ]/g, "") // Remove special characters
                    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
                        return index === 0 ? word.toLowerCase() : word.toUpperCase();
                    })
                    .replace(/\s+/g, "");
            }


            /**
             *
             * @param {Object} obj  - The object to get the value from
             * @param {string} key  - The key to get the value from
             * @returns {any} - The value
             */
            function getNestedValue (obj, key) {
                const keys = key.split(".");
                let newObj = obj;

                for (let i = 0; i < keys.length; i++) {
                    if (newObj === null || typeof newObj !== "object") {
                        return undefined;
                    }
                    newObj = newObj[keys[i]];
                }
                return newObj;
            }

            this.items.forEach((item) => {

                // console.log(item.datasets[0].kategorie_opendata, item);

                // let category;
                const multipleItems = this.items.filter(i => i.datasets[0].md_name === item.datasets[0].md_name).length > 1,
                    cats = multipleItems ? [item.datasets[0].kategorie_opendata[0], item.datasets[0].md_name] : [item.datasets[0].kategorie_opendata[0]],

                    newCats = cats.map(cat => ({
                        original: cat,
                        camel: camelize(cat)
                    })),
                    categoryString = cats.map((cat, index) => `${index !== 0 ? "children." : ""}${camelize(cat)}`).join(".");

                // Extract the category from the datasets array
                createCategory(newCats, categories);


                getNestedValue(categories, categoryString).children[`${item.id}`] = {
                    id: item.id.toString(),
                    name: !multipleItems ? item.datasets[0].md_name : item.name,
                    children: []
                };


                // console.log(categories);

                // if (!categories[category]) {
                //     id++;
                //     categories[category] = {
                //         id: id,
                //         name: category,
                //         disabled: true,
                //         children: []
                //     };
                // }


                // categories[category].children.push({
                //     id: parseInt(item.id, 10),
                //     name: item.name
                // });
            });

            /**
             *  Convert the object to an array and sort by "isCategory" key
             * @param {Object} obj - The object to convert
             * @returns {Object} - The converted and sorted object
             */
            function objectToValues (obj) {
                if (!obj || typeof obj !== "object") {
                    return obj;
                }

                if (Array.isArray(obj)) {
                    return obj.map(item => objectToValues(item));
                }

                const sortedObj = {},
                    keys = Object.keys(obj).sort((a, b) => {
                        const aIsCategory = obj[a].isCategory ? 1 : 0,
                            bIsCategory = obj[b].isCategory ? 1 : 0;

                        return bIsCategory - aIsCategory;
                    });

                for (const key of keys) {
                    if (key === "children") {
                        sortedObj[key] = Object.values(obj[key])
                            .map(child => objectToValues(child))
                            .sort((a, b) => {
                                const aIsCategory = a.isCategory ? 1 : 0,
                                    bIsCategory = b.isCategory ? 1 : 0;

                                return bIsCategory - aIsCategory;
                            });
                    }
                    else {
                        sortedObj[key] = objectToValues(obj[key]);
                    }
                }

                return sortedObj;
            }

            return Object.values(objectToValues(categories));
        },

        selectedLayers () {
            const layers = [];

            for (const layer of this.selected) {
                let layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layer.id});

                const exists = this.items.filter(item => item.id === layer.id).length > 0 && layerModel;

                if (exists) {
                    if (!layerModel) {
                        Radio.trigger("ModelList", "addModelsByAttributes", layer);
                        layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layer.id});
                    }
                    layers.push(layerModel);
                }

            }

            return sortBy(layers, (model) => model.get("selectionIDX"), this).reverse();
        }
    },

    methods: {
        updateSelectedItems (selectedIds) {
            const
                // Filter the original items based on the selected IDs
                selectedItems = selectedIds.map(layer => Radio.request("Parser", "getItemByAttributes", {id: layer}));


            this.$emit("update:selected", selectedItems.map((layer, index) => ({
                id: layer.id,
                transparency: 20,
                selectionIDX: index + 10
            })));
        },
        removeSelected (id) {
            const tmpSelected = this.selected.filter(item => item.id !== id);

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
    <div id="LayerSelector">
        <div class="form-group">
            <label
                class="form-label"
                for="step-layer"
            >
                {{ $t( "additional:modules.tools.dataNarrator.label.layers" ) }}
            </label>
            <v-expansion-panels
                id="step-layer"
                dense
                nav
            >
                <v-expansion-panel
                    v-for="(item) in selectedLayers"
                    :key="item.id"
                    color="primary"
                >
                    <v-expansion-panel-header>
                        <v-list-item-title>{{ item.attributes.name }}</v-list-item-title>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-icon
                            color="grey lighten-1"
                            @click="removeSelected(item.id)"
                        >
                            {{ icons.close }}
                        </v-icon>
                        <v-icon
                            color="grey lighten-1"
                            @click="moveLayer(item, true)"
                        >
                            {{ icons.chevronUp }}
                        </v-icon>
                        <v-icon
                            color="grey lighten-1"
                            @click="moveLayer(item, false)"
                        >
                            {{ icons.chevronDown }}
                        </v-icon>
                        <v-slider
                            v-model="item.attributes.transparency"
                            :value="item.attributes.transparency"
                            track-color="grey"
                            always-dirty
                            min="0"
                            max="90"
                            @change="changeTransparency(item, $event)"
                        />
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </div>
        <div class="form-group">
            <label
                class="form-label"
                for="available-layers"
            >
                {{ $t( "additional:modules.tools.dataNarrator.label.availableLayers" ) }}
            </label>
            <v-container
                id="available-layers"
                fluid
            >
                <v-row class="custom-row">
                    <v-col>
                        <v-treeview
                            v-model="propModel"
                            class="custom-treeview"
                            :items="transformedItems"
                            item-key="id"
                            item-children="children"
                            selection-type="leaf"
                            :disable-per-node="true"
                            open-on-click
                            search
                            selectable
                            @input="updateSelectedItems"
                        />
                    </v-col>
                </v-row>
            </v-container>
        </div>
    </div>
</template>

<style lang="scss" scoped>

.custom-row  {
    padding: 0;
    max-height: 300px;
    overflow-y: scroll;
}

.custom-treeview::v-deep .v-icon--disabled {
    display: none !important;
}

.custom-treeview::v-deep .v-treeview-node--disabled .v-treeview-node__label {
    color: rgba(0,0,0,.87) !important;
}
</style>
