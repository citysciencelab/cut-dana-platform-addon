<script>
export default {
    name: "BackgroundMap",
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
            backgroundMapsOptions: []
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
    updated () {
        if (this.selectedId) {
            this.backgroundMaps.forEach(model => {
                if (model.get("id") === this.selectedId) {
                    model.setIsVisibleInMap(true);
                    model.setIsSelected(true);
                }
                else {
                    model.setIsVisibleInMap(false);
                    model.setIsSelected(false);
                }
            });
        }
    },
    methods: {
        onChange (value) {
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
            <v-row class="custom-row">
                <v-col>
                    <v-treeview
                        :items="backgroundMapsOptions"
                        item-key="id"
                        item-text="name"
                        item-children="children"
                        selection-type="leaf"
                        :disable-per-node="true"
                        open-on-click
                        search
                        selectable
                        @change="onChange"
                    />
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
