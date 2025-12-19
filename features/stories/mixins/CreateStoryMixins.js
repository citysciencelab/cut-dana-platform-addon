
import { mapGetters, mapMutations, } from 'vuex';

import LoginMixin from '../../../mixins/LoginMixin';
import { backendUrl } from '../../../store/contantsDataNarrator';
import { uploadCoverImage } from '../services/addCoverImage';
import { mutations as editStoryMutations, state as editStoryState } from '../store/EditStoryForm';

export default {
  mixins: [ LoginMixin ],

  computed: {
    ...mapGetters('Modules/DataNarrator/EditStoryForm', Object.keys(editStoryState)),
  },

  methods: {
    ...mapMutations('Modules/DataNarrator/EditStoryForm', Object.keys(editStoryMutations)),

    async uploadCoverImage(storyId) {
      console.log('uploadCoverImage', storyId, this.coverImage);
      const token = this.accessToken;
      return await uploadCoverImage(storyId, token, this.coverImage);
    },

    async updateStory() {
      const token = this.accessToken;
      const response = await fetch(`${backendUrl}/stories/${this.selectedStoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: this.storyTitle,
          description: this.storyDescription
        })
      });

      if (response.ok) {
        await this.uploadCoverImage(this.selectedStoryId);
      }
    },

    async createStory() {
      const token = this.accessToken;
      const response = await fetch(`${backendUrl}/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: this.storyTitle,
          description: this.storyDescription
        })
      })
      let data = null;
      console.log(response);

      if (response.ok) {
        data = await response.json();
        await this.uploadCoverImage(data.id);
      }
    },

    async saveStory() {
      if (this.selectedStoryId) {
        return await this.updateStory();
      }
      return await this.createStory();
    },

    async getStory(storyId) {
      const response = await fetch(`${backendUrl}/stories/${storyId}`)

      return await response.json();
    }
  }
};
