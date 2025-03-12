import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";
import DataNarratorComponent from "./DataNarrator.vue";
import DataNarratorStore from "./store/DataNarratorStore";
import {FetchInterceptor} from "./api/FetchInterceptor";

FetchInterceptor.register();

export default {
    component: DataNarratorComponent,
    store: DataNarratorStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
