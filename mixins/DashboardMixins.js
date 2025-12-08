import { getStories } from '../features/stories/services/getStories';

export default {

    data () {
        return {
            isLoading: false,

            stories: []
        };
    },

    computed: {
    },

    methods: {
        async getAllStories() {
            this.isLoading = true;
            const response = await getStories();
            if (response.ok) {
                this.isLoading = false;
                this.stories = await response.json();
            } else {
                this.isLoading = false;
            }
        }
    }
};
