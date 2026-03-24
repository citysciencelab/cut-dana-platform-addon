<script setup>
import { mdiCancel, mdiCheck, mdiMapMarkerPlusOutline, mdiTrashCanOutline } from '@mdi/js';
import { useTranslation } from 'i18next-vue';

import { useDataNarrator } from '../../../hooks/useDataNarrator';
import { useStepForm } from '../hooks/useStepForm';

import StepTitle from './inputs/StepTitle.vue';
import StepDescription from './StepDescription.vue';
import TwoDNavigation from './TwoDNavigation.vue';

const { t } = useTranslation();

const { openLayerEditor } = useDataNarrator();
const { chapterId, stepNumber, is3d, onSubmit, onDeleteStep, isValid } = useStepForm();
const { isMobile } = useDataNarrator();

const emit = defineEmits([
  'return'
]);

</script>

<template>
  <div
    id="tool-dataNarrator-creator-stepForm"
    class="mb-1"
  >
    <form @submit.prevent="onSubmit">
      <div class="form-group">
        <v-row
          v-if="chapterId"
          class="form-input-holder xs pr-4"
        >
          <v-col
            cols="1"
            class="d-flex align-self-center"
          >
            <v-btn
              :key="chapterId"
              class="story-step-button pill-button horizontal chapter-indicator"
              icon
              :title="
                t(
                  'additional:modules.dataNarrator.label.chapter'
                )
              "
            >
            </v-btn>
          </v-col>
        </v-row>
      </div>

      <div class="form-group form-input-holder lg">
        <v-row class="pr-3">
          <v-col
            cols="1"
            class="d-flex align-self-center "
          >
            <v-btn
              v-if="chapterId"
              class="story-step-button pill-button step-indicator"
              icon
              :title="
                t(
                  'additional:modules.dataNarrator.label.stepNumber'
                )
              "
            >
              {{ stepNumber }}
            </v-btn>
          </v-col>
          <v-col
            cols="11"
            class="d-flex align-self-center step-title-holder"
          >
            <StepTitle />
          </v-col>
        </v-row>
        <v-row class="mb-2">
          <v-col
            cols="12"
            class="d-flex align-self-center "
          >
            <StepDescription />
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="12"
            class="d-flex align-self-center"
          >
            <div class="vue-label-style">
              {{ t( "additional:modules.dataNarrator.label.mapDisplay" ) }}
            </div>
          </v-col>
        </v-row>
        <TwoDNavigation />
      </div>

      <div
        class="form-group"
      >
        <label
          class="form-label"
          for="step-is3d"
        >
          {{ t( "additional:modules.dataNarrator.label.is3D" ) }}
        </label>
        <input
          id="step-is3d"
          v-model="is3d"
          class="checkbox"
          type="checkbox"
        >
      </div>

      <v-row class="mb-3">
        <v-col
          cols="12"
          class="d-flex justify-center align-self-center"
        >
          <v-btn
            class="add-btn add-layer-btn"
            small
            @click="openLayerEditor"
          >
            <v-icon left>
              {{ mdiMapMarkerPlusOutline }}
            </v-icon>
            {{ t( "additional:modules.dataNarrator.label.dataLayer" ) }}
          </v-btn>
        </v-col>
      </v-row>
      <v-footer
        class="tool-dataNarrator-creator-actions white"
        elevation="2"
        rounded
      >
        <v-card
          v-if="!isMobile"
          flat
          tile
          width="100%"
          class="lighten-1 text-center"
        >
          <v-card-text>
            <v-tooltip top>
              <template #activator="{ on }">
                <span
                  id="cancel-button"
                  class="mr-1"
                  v-on="on"
                >
                  <v-btn
                    class=""
                    icon
                    @click="emit('return')"
                  >
                    <v-icon size="24px">{{ mdiCancel }}</v-icon>
                  </v-btn>
                </span>
              </template>
              <span>
                {{ t("additional:modules.dataNarrator.button.cancel") }}
              </span>
            </v-tooltip>
            <v-tooltip top>
              <template #activator="{ on }">
                <span
                  id="delete-button"
                  class="mr-1"
                  v-on="on"
                >
                  <v-btn
                    class=""
                    icon
                    @click="onDeleteStep"
                  >
                    <v-icon size="24px">{{ mdiTrashCanOutline }}</v-icon>
                  </v-btn>
                </span>
              </template>
              <span>
                {{ t("additional:modules.dataNarrator.button.deleteStep") }}
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
                    :disabled="!isValid"
                    @click="onSubmit"
                  >

                    <v-icon size="24px">{{ mdiCheck }}</v-icon>
                  </v-btn>
                </span>
              </template>
            </v-tooltip>
          </v-card-text>
        </v-card>
        <v-container
          v-else
          fluid
          class="white"
        >
          <v-row
            class="mb-2"
            no-gutters
          >
            <v-col>
              <v-btn
                class=""
                small
                color="red"
                min-width="100%"
                @click="emit('return')"
              >
                <span>
                  {{ t("additional:modules.dataNarrator.button.cancel") }}
                </span>
              </v-btn>
            </v-col>
            <v-col>
              <v-btn
                class=""
                small
                color="red"
                min-width="100%"
                @click="onDeleteStep"
              >
                <span>{{ t("additional:modules.dataNarrator.button.deleteStep") }}</span>
              </v-btn>
            </v-col>
          </v-row>
          <v-row
            class="mb-2"
            no-gutters
          >
            <v-btn
              class=""
              small
              color="green"
              :disabled="!isValid"
              @click="onSubmit"
            >
            </v-btn>
          </v-row>
        </v-container>
      </v-footer>

      <v-alert
        v-show="!isValid"
        id="tool-dataNarrator-creator-noHTML"
        type="info"
      >
        {{ t("additional:modules.dataNarrator.warning.sendNoHTML") }}
      </v-alert>
    </form>
  </div>
</template>

<style lang="scss" scoped>

#heroicon {
    width: 1.5rem;
    height: 1.5rem;
}

#tool-dataNarrator-creator-stepForm {
    max-width: 470px;
    position: relative;

    .add-btn {
        border-radius: 20px;
        text-transform: none !important;
        min-width: 195px !important;
    }

    .add-layer-btn {
        background-color: #b8e6c2;
    }

    .add-data-btn {
        background-color: #cee1ff;
    }

    .add-data-tool-btn {
        background-color: #E6B8DC;
    }

    #tool-dataNarrator-creator-noHTML {
        margin-top: 10px;
        margin-bottom: 0;
    }

    #advanced-options {
        margin-bottom: 10px;
    }

    .expansion-panels {
        z-index: 1;
        margin-bottom: 10px;
    }

    &::v-deep {
        .v-text-field.v-text-field--enclosed:not(.v-text-field--rounded),
        > .v-input__control,
        > .v-input__slot {
            margin: 0;
            padding: 0 0 0 0.3125rem;
        }

      .v-text-field.v-text-field--solo:not(.v-text-field--solo-flat),
      > .v-input__control,
      > .v-input__slot {
            height: 34px;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 0;
            box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
        }

        .v-text-field.v-text-field--solo.v-input--is-focused:not(.v-text-field--solo-flat)
        > .v-input__control,
        > .v-input__slot {
            border-color: #66afe9;
            outline: 0;
            box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.08),
            0 0 8px rgba(102, 175, 233, 0.6);
        }
    }

    label.required:after { content: '*';color:red; }

    .stepForm-inputs-centerCoordinate {
        display: grid;
        grid-template-columns: 1fr 1fr 100px;
        grid-gap: 5px;
        align-items: end;
    }

    .stepForm-3d-others {
        grid-template-columns: 1fr 1fr !important;
    }

    .stepForm-inputs-3d-position {
        grid-template-columns: 1fr 1fr 1fr 1fr !important;
    }

    .stepForm-inputs-zoomLevel {
        display: grid;
        grid-template-columns: 1fr 100px;
        grid-gap: 5px;
        align-items: end;
    }

}
</style>
