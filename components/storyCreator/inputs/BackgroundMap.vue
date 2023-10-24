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
            default: () => Radio.request("ModelList", "getModelsByAttributes", {isBaseLayer: true})
        }
    },
    data () {
        return {
            backgroundMapsOptions: []
        };
    },
    mounted () {
        this.backgroundMapsOptions = this.backgroundMaps.map(model => {
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
            {{ $t("additional:modules.tools.dataNarrator.label.backgroundMap") }}
        </label>
        <v-select
            id="background-map"
            :value="selectedId"
            :items="backgroundMapsOptions"
            item-text="name"
            item-value="id"
            dense
            solo
            hide-details
            @change="onChange"
        />
    </div>
</template>
