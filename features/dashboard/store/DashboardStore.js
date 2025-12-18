import { generateSimpleGetters, generateSimpleMutations } from '../../../../../../src/shared/js/utils/generators';

export const state = {
  stories: [],
  mode: 'all',
};

export const mutations = {
  ...generateSimpleMutations(state),
};

export const getters = {
  ...generateSimpleGetters(state)
};

export default {
  namespaced: true,
  state,
  mutations,
  getters
};
