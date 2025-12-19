import { mapMutations } from 'vuex';

import DataNarratorWindowMixins from './DataNarratorWindowMixins';

export default {
  mixins: [ DataNarratorWindowMixins ],

  methods: {
    ...mapMutations('Modules/DataNarrator', [ 'setMode' ]),
    gotoPage(page) {
      this.setMode(page);
      this.moveTool();
    }
  }
};
