import DataNarrator from "./components/DataNarrator.vue";
import DataNarratorStore from "./store/DataNarrator";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: DataNarrator,
    store: DataNarratorStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
