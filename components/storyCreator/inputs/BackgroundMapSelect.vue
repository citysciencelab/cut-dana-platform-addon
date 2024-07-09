<script>

export default {
    name: "BackgroundMapSelect",
    props: {
        selectedId: {
            type: String,
            default: null
        },
        backgroundMaps: {
            type: Array,
            default: () => Radio.request("ModelList", "getModelsByAttributes", {backgroundMap: true})
        }
    },
    data () {
        return {
            backgroundMapsOptions: [],
            selected: this.selectedId,
            defaultBackgroundMap: null
        };
    },
    mounted () {
        this.defaultBackgroundMap = this.backgroundMaps.find(model => model.get("isSelected"))?.get("id");
        this.backgroundMapsOptions = this.backgroundMaps.map(model => {
            if (this.selected) {
                this.setActiveMap(model, this.selected);
            }

            return {
                id: model.get("id"),
                name: model.get("name")
            };
        });
    },
    beforeDestroy () {
        this.backgroundMaps.forEach(model => {
            this.setActiveMap(model, this.defaultBackgroundMap);
        });
    },
    methods: {
        onChange (value) {
            const val = value || this.defaultBackgroundMap;

            this.backgroundMaps.forEach(model => {
                this.setActiveMap(model, val);
            });

            this.$emit("update:background-map-id", value);
        },

        setActiveMap (model, id) {
            if (model.get("id") === id) {

                if (!model.get("isVisibleInMap") && !model.get("isSelected")) {
                    model.setIsVisibleInMap(true);
                    model.setIsSelected(true);
                }
            }
            else {
                model.setIsVisibleInMap(false);
                model.setIsSelected(false);
            }
        }
    }
};
</script>

<template>
    <v-select
        id="background-map"
        v-model="selected"
        :items="backgroundMapsOptions"
        :label="$t( 'additional:modules.tools.dataNarrator.label.backgroundMap' )"
        dense
        solo
        hide-details
        item-text="name"
        item-value="id"
        @change="onChange"
    />
</template>
