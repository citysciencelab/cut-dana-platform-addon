<script>
import {EventEmitter} from "../../utils/EventEmitter";
import actions from "../../store/actionsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import {mapActions, mapGetters, mapMutations} from "vuex";

export default {
    name: "LayerSelector",
    props: {
        items: {
            type: Array,
            required: true,
            default: () => []
        },
        selected: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        // console.log all the props
        // ...mapGetters("Tools/DataNarrator", Object.keys(getters))
        transformedItems() {
            let id = 0;
            let categories = {};

            this.items.forEach((item, index) => {
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
                    id: parseInt(item.id),
                    name: item.name
                });
            });

            console.log(Object.values(categories))
            return Object.values(categories);
        }
    },
    created () {
        
    },
    methods: {
        updateSelectedItems(selectedIds) {
            // Filter the original items based on the selected IDs
            const selectedItems = this.items.filter(item => selectedIds.includes(item.id)).map(item => ({
                value: item.id,
                text: item.name
            }));
            this.$emit('update:selected', selectedItems);
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
            v-model="selected"
            :items="transformedItems"
            item-key="id"
            item-text="name"
            item-children="children"
            selectable
            @input="updateSelectedItems"
        ></v-treeview>
    </div>
</template>

<!-- <style lang="scss" scoped>

#LayerSelector {

}

</style> -->
