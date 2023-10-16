<script>
import {mdiAccount} from "@mdi/js";
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
                account: mdiAccount
            }
        };
    },
    computed: {
        // console.log all the props
        // ...mapGetters("Tools/DataNarrator", Object.keys(getters))
        transformedItems () {
            let id = 0;
            const categories = {};

            this.items.forEach((item) => {
                // Extract the category from the datasets array
                const category = item.datasets[0].kategorie_opendata[0];

                if (!categories[category]) {
                    id++;
                    categories[category] = {
                        id: id,
                        name: category,
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
            console.log(selectedIds);
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
            selectable
            @input="updateSelectedItems"
        />
    </div>
</template>

<!-- <style lang="scss" scoped>

#LayerSelector {

}

</style> -->
