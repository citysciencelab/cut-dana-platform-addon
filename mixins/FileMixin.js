import { backendUrl } from '../store/contantsDataNarrator';


export default {
    mixins: [],

    methods: {
        getFileUrl(file) {
            return `${backendUrl}/files/${file.fileContext}/${file.filename}`;
        }
    }
};
