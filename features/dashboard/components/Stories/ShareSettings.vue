<script setup>
import { useTranslation } from 'i18next-vue';

const { t } = useTranslation();
defineProps({
  privateStory: {
    type: Boolean,
    default: false
  },
  sharedWith: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <div id="shareSettingsInput">
    <div class="form-group">
      <v-checkbox
        id="story-private"
        :value="privateStory"
        :label="t('additional:modules.dataNarrator.label.private')"
        hide-details="auto"
        @change="$emit('update:private-story', $event)"
      />
    </div>

    <div
      v-if="privateStory"
      class="form-group"
    >
      <label for="sharedWith">
        {{ t( "additional:modules.dataNarrator.label.sharedWith" ) }}
      </label>
      <BFormTags
        :value="sharedWith"
        class="form-control"
        input-type="email"
        input-id="sharedWith"
        tag-variant="primary"
        tag-pills
        :placeholder="t('additional:modules.dataNarrator.label.sharedWithPlaceholder')"
        :add-button-text="t('additional:modules.dataNarrator.button.addSharedWith')"
        :duplicate-tag-text="t('additional:modules.dataNarrator.label.sharedWithDuplicate')"
        @input="value => $emit('update:shared-with', value)"
      />
    </div>
  </div>
</template>

<style lang="scss">
#shareSettingsInput {
    .form-group:last-child {
        margin-bottom: 15px;
    }
    .b-form-tags {

        .sr-only {
            display: none !important;
        }

        .b-form-tags-list {
            display: inline-block !important;
            padding-left: 0;

            .badge {
                // color: black !important;
                background-color: #2196f3 !important;
                font-size: 1em !important;
                border-radius: 1em;
                margin-right: 0.25em;

                .b-form-tag-remove {
                    padding-left: 0.5em !important;
                }
            }
        }
    }
}
</style>
