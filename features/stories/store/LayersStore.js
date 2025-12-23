import { generateSimpleGetters, generateSimpleMutations } from '../../../../../../src/shared/js/utils/generators';

import { createLogger } from '../../../utils/logger';
const logger = createLogger('LayerStore');

export const state = {
  layersTree: [],
  loading: false,
  error: null,
  sourceURL: 'https://geodienste.hamburg.de/services-internet.json',
};

export const mutations = {
  ...generateSimpleMutations(state),

  setLayersTree(state, payload) {
    state.layersTree = payload;
  },
  setLoading(state, payload) {
    state.loading = payload;
  },
  setError(state, payload) {
    state.error = payload;
  },
  setSourceURL(state, payload) {
    state.sourceURL = payload;
  },
};

export const actions = {
  async fetchAndSortServices({ commit, state }, { url } = {}) {
    const URL = url || state.sourceURL;

    commit('setLoading', true);
    commit('setError', null);

    try {
      const norm = v => (String(v ?? '').trim() || 'ohne Kategorie');
      const normSub = v => (String(v ?? '').trim() || 'ohne Subkategorie');

      const res = await fetch(URL);
      const services = await res.json();

      const filtered = Array.isArray(services)
        ? services.filter(s => {
          const t = String(s?.typ || '').toUpperCase();
          return t === 'WMS';
        })
        : [];

      const catMap = new Map();

      filtered.forEach(svc => {
        const dsArr = Array.isArray(svc.datasets) ? svc.datasets : [];

        if (!dsArr.length) {
          const cat = 'ohne Kategorie';
          const sub = 'ohne Subkategorie';
          if (!catMap.has(cat)) catMap.set(cat, new Map());
          const subMap = catMap.get(cat);
          if (!subMap.has(sub)) subMap.set(sub, []);
          subMap.get(sub).push(svc);
          return;
        }

        dsArr.forEach(ds => {
          const cats = Array.isArray(ds.kategorie_opendata) && ds.kategorie_opendata.length
            ? ds.kategorie_opendata.map(norm)
            : [ 'ohne Kategorie' ];
          const sub = normSub(ds.md_name);

          cats.forEach(cat => {
            if (!catMap.has(cat)) catMap.set(cat, new Map());
            const subMap = catMap.get(cat);
            if (!subMap.has(sub)) subMap.set(sub, []);
            const list = subMap.get(sub);
            if (!list.some(x => x.id === svc.id)) list.push(svc);
          });
        });
      });

      const layersTree = [ ...catMap.entries() ]
        .sort(([ a ], [ b ]) => a.localeCompare(b))
        .map(([ category, subMap ]) => ({
          category,
          subcategories: [ ...subMap.entries() ]
            .sort(([ a ], [ b ]) => a.localeCompare(b))
            .map(([ name, layers ]) => ({
              name,
              layers: layers.sort((x, y) => x.name.localeCompare(y.name))
            }))
        }));

      commit('setLayersTree', layersTree);
    } catch (err) {
      logger.error('Error fetching or processing services:', err);
      commit('setError', err instanceof Error ? err.message : String(err));
      commit('setLayersTree', []);
    } finally {
      commit('setLoading', false);
    }
  }
};

export const getters = {
  ...generateSimpleGetters(state),
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
