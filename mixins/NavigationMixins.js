import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersDataNarrator";
import DataNarratorWindowMixins from "./DataNarratorWindowMixins";

export default {
    mixins: [DataNarratorWindowMixins],

    computed: {
        ...mapGetters("Modules/DataNarrator", Object.keys(getters)),
    },

    methods: {
        ...mapMutations("Modules/DataNarrator", ["setMode"]),
        gotoPage(page) {
            this.setMode(page);
            this.moveTool();
        }
    }
};
