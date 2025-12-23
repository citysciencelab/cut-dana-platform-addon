import { generateSimpleGetters, generateSimpleMutations } from '../../../../../../src/shared/js/utils/generators';

import { createLogger } from '../../../utils/logger';
const logger = createLogger('EditStoryForm');

export const state = {
  isLoading: false,
  selectedStoryId: null,
  coverImage: null,
  storyTitle: '',
  storyDescription: '',
  storyChapters: [],
};

export const mutations = {
  ...generateSimpleMutations(state),

  setSelectedStoryId (state, selectedStoryId) {
    state.selectedStoryId = selectedStoryId;
  },

  setStoryData (state, storyData) {
    logger.info('storyData', storyData);
    state.storyTitle = storyData.title;
    state.storyDescription = storyData.description;
    state.storyChapters = storyData.chapters;
  },

  resetStoryForm (state) {
    state.storyTitle = '';
    state.storyDescription = '';
    state.isLoading = false;
    state.selectedStoryId = null;
  }
};

export const getters = {
  ...generateSimpleGetters(state)
};

export default {
  namespaced: true,
  state,
  mutations,
  getters,
};
