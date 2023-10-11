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
            default: []
        },
        selected: {
            type: Array,
            default: []
        }
    },
    data () {
        return {

        };
    },
    computed: {
        // console.log all the props
        // ...mapGetters("Tools/DataNarrator", Object.keys(getters))
        
    },
    created () {
        
    },
    methods: {

    }
};
</script>

<template>
    <div id="LayerSelector">
        <v-select
            v-model="selected"
            :items="items"
            multiple
            dense
            solo
            hide-details
        />
    </div>
</template>

<style lang="scss" scoped>

#LayerSelector {

}

</style>
