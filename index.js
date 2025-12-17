import { FetchInterceptor } from './api/FetchInterceptor';
import DataNarratorComponent from './DataNarrator.vue';
import deLocale from './locales/de/additional.json';
import enLocale from './locales/en/additional.json';
import DataNarratorStore from './store/DataNarratorStore';

FetchInterceptor.register();

export default {
  component: DataNarratorComponent,
  store: DataNarratorStore,
  locales: {
    de: deLocale,
    en: enLocale
  }
};
