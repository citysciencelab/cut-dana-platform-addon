<script>

export default {
    name: "LayerSelectorOld",
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
    computed: {
        // console.log all the props
        // ...mapGetters("Tools/DataNarrator", Object.keys(getters))

    },

    methods: {
        updateSelectedItems (value) {
            this.$emit("update:selected", value);
        }
    }


};
</script>

<template>
    <div id="LayerSelector">
        <v-select
            :value="selected"
            :items="items"
            multiple
            dense
            solo
            hide-details
            @input="updateSelectedItems"
        />
    </div>
</template>

<!-- <style lang="scss" scoped>

#LayerSelector {

}

</style> -->
