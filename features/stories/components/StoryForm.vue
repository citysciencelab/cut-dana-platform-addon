<script setup>
import { mdiCancel, mdiCheck, mdiEyeOutline, mdiPlus } from '@mdi/js';
import { useTranslation } from 'i18next-vue';
import { onMounted, ref } from 'vue';

import { useDataNarrator } from '../../../hooks/useDataNarrator';
import { dataNarratorModes } from '../../../store/contantsDataNarrator';
import { useStoryForm } from '../hooks/useStoryForm';

import CoverSelector from './inputs/CoverSelector.vue';

const { t } = useTranslation();

const { gotoPage } = useDataNarrator();
const {
  addChapter,
  chapterName,
  chapters,
  description,
  fetchStory,
  storyId,
  updateStory,
} = useStoryForm();

const notSaving = ref(true);

const hasStoryThenFetch = async () => {
  console.log('storyId', storyId);
  if (storyId) {
    await fetchStory();
  }
}

onMounted(async () => {
  await hasStoryThenFetch();
})
</script>

<template>
  <div id="tool-dataNarrator-creator-storyForm">
    <form
      id="story-form"
      @submit.prevent="updateStory"
    >
      <CoverSelector
        :back-button-msg="t('additional:modules.dataNarrator.button.cancel')"
        @back-click="() => gotoPage(dataNarratorModes.DASHBOARD)"
      />

      <div class="form-group form-input-holder">
        <v-textarea
          id="description"
          v-model="description"

          variant="outlined"
          hide-details="true"
          rows="4"
          :label="t(
            'additional:modules.dataNarrator.label.storyDescription'
          )"
        />

        <v-expansion-panels id="advanced-options">
          <v-expansion-panel>
            <v-expansion-panel-title>
              {{
                t("additional:modules.dataNarrator.label.advancedOptions")
              }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div>
                <v-checkbox
                  id="story-scrolly"
                  :value="false"
                  :label="t('additional:modules.dataNarrator.label.scrolly')"
                />
              </div>
              <div
                v-if="false"
              >
                <div class="vue-label-style">
                  {{ t('additional:modules.dataNarrator.label.interval') }}
                </div>
                <v-slider
                  id="story-interval"
                  step="1"
                  max="40"
                  min="0"
                  thumb-label
                  hide-details="true"
                />

                <!--
                                TODO: Unsure if the combination of both (scroll and interval) is a necessity
                                <v-alert
                                    v-show="storyConf.displayType === 'scrolly' && storyConf.storyInterval > 0"
                                    type="info"
                                >
                                    {{
                                        $t("additional:modules.tools.dataNarrator.warning.noIntervalOnScrolly")
                                    }}
                                </v-alert>-->
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <v-row>
        <v-col>
          <div
            v-for="chapter in chapters"
            :key="chapter.id"
            class="vue-label-style"
          >
            {{ chapter.name }}
            {{ chapter.sequence }}
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-text-field
            v-model="chapterName"
            :label="t('additional:modules.dataNarrator.label.chapterName')"
            outlined
            dense
            clearable
          />
        </v-col>
      </v-row>

      <v-row class="mb-2">
        <v-col class="d-flex justify-center align-center gap-2">
          <v-btn
            variant="plain"
            class="pill-button story-chapter-button"
            :title="
              t(
                'additional:modules.dataNarrator.button.addChapter'
              )
            "
            @click="addChapter"
          >
            <v-icon>{{ mdiPlus }}</v-icon>
          </v-btn>
          <div
            class="vue-label-style add-chapter-label"
            role="button"
            tabindex="0"
            @click="addChapter"
            @keydown="addChapter"
          >
            {{ t("additional:modules.dataNarrator.label.addChapter") }}
          </div>
        </v-col>
      </v-row>

      <v-footer
        v-if="notSaving"
        class="tool-dataNarrator-creator-actions white"
        elevation="1"
        rounded
      >
        <v-card
          flat
          tile
          width="100%"
          class="lighten-1 text-center"
        >
          <v-card-text>
            <v-btn
              variant="plain"
              icon
              class=""
              @click="gotoPage(dataNarratorModes.DASHBOARD)"
            >
              <v-icon size="24px">
                {{ mdiCancel }}
              </v-icon>
              <v-tooltip
                activator="parent"
                location="top"
              >
                {{
                  t("additional:modules.dataNarrator.button.cancel")
                }}
              </v-tooltip>
            </v-btn>

            <v-btn
              variant="plain"
              icon
              class=""
            >
              <v-icon size="24px">
                {{ mdiEyeOutline }}
              </v-icon>
              <v-tooltip
                activator="parent"
                location="top"
              >
                {{
                  t("additional:modules.dataNarrator.button.previewStory")
                }}
              </v-tooltip>
            </v-btn>

            <v-btn
              variant="plain"
              class=""
              icon
              @click="updateStory"
            >
              <!--                                        :disabled="!currentStory.steps || !currentStory.steps.length"-->
              <!--                                        @click="confirmBeforeSaving"-->
              <v-icon size="24px">
                {{ mdiCheck }}
              </v-icon>
              <v-tooltip
                activator="parent"
                location="top"
              >
                {{
                  t("additional:modules.dataNarrator.button.uploadStory")
                }}
              </v-tooltip>
            </v-btn>
          </v-card-text>
        </v-card>
      </v-footer>

      <v-alert
        v-show="true"
        id="tool-dataNarrator-creator-noSteps"
        type="info"
        class="white"
      >
        {{
          t("additional:modules.dataNarrator.warning.sendNoSteps")
        }}
      </v-alert>
    </form>
  </div>
</template>

<style scoped lang="scss">
#tool-dataNarrator-creator-storyForm {
    max-width: 470px;
    position: relative;

    #tool-dataNarrator-creator-noSteps {
        margin-top: 10px;
        margin-bottom: 0;
    }

    label.required:after {
        content: '*';
        color: red;
    }

    .story-chapter-button {
        min-width: 32px;
        height: 36px;
        padding: 0;
    }

    .add-chapter-label {
        cursor: pointer;
    }

    #save-alert {
        position: fixed;
        left: 40%;
        top: 20%;
        background-color: white !important;
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
