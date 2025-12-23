<script setup>
import { mdiCancel, mdiCheck } from '@mdi/js';
import { useTranslation } from 'i18next-vue';

import { createLogger } from '../../../../utils/logger.js';

import ShareSettings from './ShareSettings.vue';

const { t } = useTranslation();

const logger = createLogger('ShareSettingsForm.vue');

const emit = defineEmits([
  'close:shared-settings'
]);

function saveStorySettings() {
  logger.debug('saveStorySettings');
}
</script>

<template>
  <v-card-text>
    <ShareSettings
      :private-story="true"
      :shared-with="[]"
      @update:private-story="newValue => newValue = true"
      @update:shared-with="newValue => newValue = true"
    />

    <div class="form-group">
      <v-tooltip top>
        <template #activator="{ on }">
          <span
            id="reset-button"
            class="mr-1"
            v-on="on"
          >
            <v-btn
              class="pill-button"
              icon
              @click="emit('close:shared-settings')"
            >
              <v-icon size="24px">{{ mdiCancel }}</v-icon>
            </v-btn>
          </span>
        </template>
        <span>
          {{
            t("common:button.cancel")
          }}
        </span>
      </v-tooltip>


      <v-tooltip top>
        <template #activator="{ on }">
          <span
            id="save-button"
            class="mr-1"
            v-on="on"
          >
            <v-btn
              class=""
              icon
              @click="saveStorySettings()"
            >

              <v-icon size="24px">{{ mdiCheck }}</v-icon>
            </v-btn>

          </span>
        </template>
        <span>
          {{
            t("common:button.save")
          }}
        </span>
      </v-tooltip>
    </div>
  </v-card-text>
</template>
