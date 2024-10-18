<script>
import LayerSelectedPreview from "./LayerSelectedPreview.vue";
import LayerUtilities from "../../../mixins/LayerUtilities";

export default {
    name: "LayerSelector",
    components: {LayerSelectedPreview},
    mixins: [LayerUtilities],
    props: {
        items: {
            type: Array,
            default: () => []
        },
        selected: {
            type: Array,
            default: () => []
        },
        legend: {
            type: String,
            default: "additional:modules.tools.dataNarrator.label.layers"
        }
    },
    computed: {
        propModel: {
            get () {
                return this.selected.map(item => item.id);
            },
            set (value) {
                const
                    // Filter the original items based on the selected IDs
                    selectedItems = value.map(layer => this.layerConfigById(layer));

                this.$emit("update:selected", selectedItems.map((layer, index) => ({
                    id: layer.id,
                    transparency: 20,
                    selectionIDX: index + 10
                })));
            }
        },
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


            this.items.filter(i => i.datasets?.length > 0).forEach((item) => {


                // let category;
                const multipleItems = this.items.filter(
                        i => i.datasets?.length > 0 && i.datasets[0].md_name === item.datasets[0].md_name
                    ).length > 1,
                    cats = multipleItems ?
                        [item.datasets[0].kategorie_opendata[0], item.datasets[0].md_name] :
                        [item.datasets[0].kategorie_opendata[0]],
                    newCats = cats.map(cat => ({
                        original: cat,
                        camel: camelize(cat)
                    })),
                    categoryString = cats.map(
                        (cat, index) => `${index !== 0 ? "children." : ""}${camelize(cat)}`
                    ).join(".");

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
        }
    },

    methods: {
        forwardUpdateSelected (selected) {
            this.$emit("update:selected", selected);
        },
        updateSelectedItems (selectedIds) {
            const
                // Filter the original items based on the selected IDs
                selectedItems = selectedIds.map(layer => Radio.request("Parser", "getItemByAttributes", {id: layer}));

            this.$emit("update:selected", selectedItems.map((layer, index) => ({
                id: layer.id,
                transparency: 20,
                selectionIDX: index + 10
            })));
        }
        // TODO: doesnt seem to be needed28.02
        // removeSelected (id) {
        //     const tmpSelected = this.selected.filter(item => item.id !== id);
        //
        //     this.$emit("update:selected", tmpSelected);
        // }
    }
};
</script>

<template>
    <div id="LayerSelector">
        <LayerSelectedPreview
            :selected="selected"
            :selected-layers="getSelectedLayers(selected, items)"
            @update:selected="forwardUpdateSelected"
        />
        <div class="form-group">
            <label
                class="form-label layer-headline"
                for="available-layers"
            >
                {{ $t(legend) }}
            </label>
            <v-container
                id="available-layers"
                fluid
            >
                <v-row class="custom-row">
                    <v-col>
                        <v-treeview
                            v-model="propModel"
                            :disable-per-node="true"
                            :items="transformedItems"
                            class="custom-treeview"
                            dense
                            item-children="children"
                            item-key="id"
                            open-on-click
                            search
                            selectable
                            selection-type="leaf"
                            @input="updateSelectedItems"
                        />
                    </v-col>
                </v-row>
            </v-container>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.layer-headline {
    padding-left: 10px;
    padding-top: 10px;
}

.custom-row {
    padding: 0;
    max-height: 300px;
    overflow-y: scroll;
}

.custom-treeview:deep .v-icon--disabled {
    display: none !important;
}

.custom-treeview:deep .v-treeview-node--disabled .v-treeview-node__label {
    color: rgba(0, 0, 0, .87) !important;
}


</style>
