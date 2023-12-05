<script>

import {mapGetters} from "vuex";
import getters from "../../store/gettersDataNarrator";

export default {
    name: "BackButton",
    props: {
        tooltip: {
            type: String,
            default: "additional:modules.tools.dataNarrator.button.backToStory"
        }
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters))
    }
};
</script>

<template>
    <span>
        <span
            role="button"
            tabindex="0"
        >
            <v-tooltip left>
                <template #activator="{ on, attrs }">
                    <v-icon
                        v-bind="attrs"
                        v-on="on"
                        @click="$emit('click')"
                        @keydown="$emit('click')"
                    >keyboard_backspace</v-icon>
                </template>
                <span>{{ $t(tooltip) }}</span>
            </v-tooltip>
        </span>
        <span class="story-title">{{ currentStory.title }}</span>
    </span>
</template>

<style lang="scss" scoped>
  .v-icon {
      cursor: pointer;
  }

  .story-title {
      font-weight: bold;
      text-transform: uppercase;
      margin-left: 10px;
  }
</style>
