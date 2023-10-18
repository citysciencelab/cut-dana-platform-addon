<script>
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

        };
    },
    computed: {
        // console.log all the props
        // ...mapGetters("Tools/DataNarrator", Object.keys(getters))
        transformedItems () {
            let id = 0;
            const categories = {};

            // console.log(this.items);


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
                    if (obj === null || typeof obj !== "object") {
                        return undefined;
                    }
                    newObj = obj[keys[i]];
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


                getNestedValue(categories, categoryString).children[`~~~~~~~~~${item.id.toString()}`] = {
                    id: parseInt(item.id, 10),
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
        }
    },

    methods: {
        updateSelectedItems (selectedIds) {
            // Filter the original items based on the selected IDs
            const selectedItems = selectedIds.map(id => id.toString());

            this.$emit("update:selected", selectedItems);
        }
    }
};
</script>

<template>
    <div id="LayerSelector">
        <v-treeview
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
    </div>
</template>

<!-- <style lang="scss" scoped>

#LayerSelector {

}

</style> -->
