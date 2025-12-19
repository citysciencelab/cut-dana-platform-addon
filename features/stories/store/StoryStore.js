import { generateSimpleGetters, generateSimpleMutations } from '../../../../../../src/shared/js/utils/generators';
import { backendUrl } from '../../../store/contantsDataNarrator.js';

export const state = {
  selectedStoryId: null,
  stories: [],
  loading: false,
  error: null,
};

export const mutations = {
  ...generateSimpleMutations(state),

  setSelectedStoryId (state, selectedStoryId) {
    state.selectedStoryId = selectedStoryId;
  },
};

export const getters = {
  ...generateSimpleGetters(state)
};

export const actions = {
  fetchStories: async ({ commit }, mode) => {
    const url = `${backendUrl}/stories/${mode}`;
    commit('setLoading', true);
    commit('setError', null);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      commit('setStories', data);
    } catch (err) {
      commit('setError', err.message || 'Failed to fetch stories');
    } finally {
      commit('setLoading', false);
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
};
