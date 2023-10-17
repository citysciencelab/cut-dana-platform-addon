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

            this.items.forEach((item) => {

                let category;

                // Extract the category from the datasets array
                if (!item.datasets || !item.datasets[0]) {
                    category = "Sonnstiges";
                }
                else {
                    category = item.datasets[0].kategorie_opendata[0];
                }

                if (!categories[category]) {
                    id++;
                    categories[category] = {
                        id: id,
                        name: category,
                        disabled: true,
                        children: []
                    };
                }


                categories[category].children.push({
                    id: parseInt(item.id, 10),
                    name: item.name
                });
            });

            return Object.values(categories);
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
        <!-- <v-select
            v-model="selected"
            :items="items"
            multiple
            dense
            solo
            hide-details
            @input="updateSelectedItems"
        /> -->

        <v-treeview
            :items="transformedItems"
            item-key="id"
            item-text="name"
            item-children="children"
            selection-type="independent"
            selectable
            @input="updateSelectedItems"
        />
    </div>
</template>

<!-- <style lang="scss" scoped>

#LayerSelector {

}

</style> -->
