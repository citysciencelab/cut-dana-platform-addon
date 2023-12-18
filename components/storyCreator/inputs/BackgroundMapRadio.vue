<script>
export default {
    name: "BackgroundMapRadio",
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
            selected: this.selectedId
        };
    },
    mounted () {
        this.backgroundMapsOptions = this.backgroundMaps.map(model => {

            // console.log(modelObj, model);

            return {
                id: model.get("id"),
                name: model.get("name")
            };
        });
    },
    methods: {
        onChange (value) {
            if (this.selected) {
                this.backgroundMaps.forEach(model => {
                    if (model.get("id") === this.selected) {

                        if (!model.get("isVisibleInMap") && !model.get("isSelected")) {
                            model.setIsVisibleInMap(true);
                            model.setIsSelected(true);
                        }
                    }
                    else {
                        model.setIsVisibleInMap(false);
                        model.setIsSelected(false);
                    }
                });
            }
            this.$emit("update:background-map-id", value);
        }
    }
};
</script>

<template>
    <div class="form-group">
        <label
            class="form-label"
            for="background-map"
        >
            {{ $t( "additional:modules.tools.dataNarrator.label.backgroundMap" ) }}
        </label>
        <v-container
            id="background-map"
            fluid
        >
            <v-radio-group
                v-model="selected"
                dense
                column
                @change="onChange"
            >
                <v-radio
                    v-for="(item, index) in backgroundMapsOptions"
                    :key="index"
                    :label="`${item.name}`"
                    :value="item.id"
                    class="background-map-radio"
                    ripple
                />
            </v-radio-group>
        </v-container>
    </div>
</template>

<style lang="scss">

.background-map-radio  {
    .v-label {
        font-size: 12px !important;
    }
}
</style>
