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
                return this.selected;
            },
            set (value) {
                this.$emit("update:selected", value);
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
                        id: id,
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


                getNestedValue(categories, categoryString).children[`~~~~~~~~~${item.id}`] = {
                    id: item.id,
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
             *  Convert the object to an array
             * @param {Object} obj - The object to convert
             * @returns {Object} - The converted object
             */
            function objectToValues (obj) {
                if (!obj || typeof obj !== "object") {
                    return obj;
                }

                if (Array.isArray(obj)) {
                    return obj.map(item => objectToValues(item));
                }

                for (const key in obj) {
                    if (key === "children") {
                        obj[key] = Object.values(obj[key]).map(child => objectToValues(child));
                    }
                    else {
                        obj[key] = objectToValues(obj[key]);
                    }
                }

                return obj;
            }


            return Object.values(objectToValues(categories));
        },

        selectedLayers () {
            const layers = [];

            for (const layer of this.selected) {
                let layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layer});

                const exists = this.items.filter(item => item.id === layerModel.id).length > 0;

                if (exists) {
                    if (!layerModel) {
                        Radio.trigger("ModelList", "addModelsByAttributes", layer);
                        layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layer});
                    }
                    layers.push(layerModel);
                }
            }

            return sortBy(layers, (model) => model.get("selectionIDX"), this).reverse();
        }
    },

    methods: {
        updateSelectedItems (selectedIds) {
            // Filter the original items based on the selected IDs
            const selectedItems = selectedIds.map(id => id.toString());

            this.$emit("update:selected", selectedItems);
        },
        removeSelected (id) {
            const tmpSelected = this.selected.filter(item => item !== id);

            this.$emit("update:selected", tmpSelected);
        },
        moveLayer (layer, direction) {
            const layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layer.id}),
                index = this.selectedLayers.findIndex(item => item.id === layer.id),
                newSelection = [...this.selected];

            let newIndex;

            // targetModel = Radio.request("ModelList", "getModelByAttributes", {id: this.selectedLayers[newIndex].id});


            // console.log(layerModel, targetModel, this.selectedLayers[newIndex]);


            if (direction && index > 0) {
                // Move layer up
                [newSelection[index - 1], newSelection[index]] = [newSelection[index], newSelection[index - 1]];
                newIndex = index - 1;
            }
            else if (!direction && index < newSelection.length - 1) {
                // Move layer down
                [newSelection[index + 1], newSelection[index]] = [newSelection[index], newSelection[index + 1]];
                newIndex = index + 1;
            }
            if (newIndex !== undefined) {
                // you may swap the indeces here
                const targetModel = Radio.request("ModelList", "getModelByAttributes", {id: this.selectedLayers[newIndex].id});

                layerModel.setSelectionIDX(targetModel.get("selectionIDX"));
                targetModel.setSelectionIDX(layerModel.get("selectionIDX"));
                Radio.trigger("ModelList", "updateSelection");
            }
            // targetModel.setSelectionIDX(layerModel.get("selectionIDX"));
            // layerModel.setSelectionIDX(targetModel.get("selectionIDX"));


            this.$emit("update:propModel", newSelection);
        }
    }
};
</script>

<template>
    <div id="LayerSelector">
        <v-list
            dense
        >
            <v-list-item
                v-for="(item) in selectedLayers"
                :key="item.id"
            >
                <v-list-item-content>
                    <v-list-item-title v-text="item.attributes.name" />
                </v-list-item-content>
                <v-list-item-action>
                    <v-icon
                        color="grey lighten-1"
                        @click="removeSelected(item.id)"
                    >
                        {{ icons.close }}
                    </v-icon>
                </v-list-item-action>
                <!-- <v-list-item-action>
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
                </v-list-item-action> -->
            </v-list-item>
        </v-list>
        <v-container fluid>
            <v-row class="custom-row">
                <v-col>
                    <v-treeview
                        v-model="propModel"
                        :items="transformedItems"
                        item-key="id"
                        item-text="name"
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
</template>

<style lang="scss" scoped>

.custom-row  {
    padding: 0;
    max-height: 300px;
    overflow-y: scroll;
}

</style>
