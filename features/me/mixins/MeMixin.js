import LoginMixin from '../../../mixins/LoginMixin';
import { getMe } from '../services/getMe';

export default {
    mixins: [ LoginMixin ],

    methods: {
        async getMe() {
            await getMe(this.userId, this.accessToken);
        }
    }
};
