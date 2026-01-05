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
              <!--                            {{ chapterLetter(step.associatedChapter ) }}-->
            </v-btn>
          </v-col>

          <!--                    <v-col-->
          <!--                        cols="11"-->
          <!--                        class="text-center chapter-title-holder"-->
          <!--                    >-->
          <!--                        <v-text-field-->
          <!--                            id="chapter-title"-->
          <!--                            v-model="step.chapterTitle"-->
          <!--                            class="vue-text-all-top"-->
          <!--                            :label="t(-->
          <!--                                'additional:modules.dataNarrator.label.chapterTitle'-->
          <!--                            )"-->
          <!--                            hide-details="auto"-->
          <!--                        />-->
          <!--                    </v-col>-->
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
        <!--                TODO: Hier kam vom Remote <div v-if="temp.is3D"> ist das wichtig? Löst das etwas-->
        <!--                <Three3Navigation/>-->

        <!--                <v-row-->
        <!--                    v-if="step.is3D && cesiumEnabled"-->
        <!--                    class="mb-2"-->
        <!--                >-->
        <!--                    <v-col-->
        <!--                        cols="3"-->
        <!--                        class="d-flex align-self-center mr-2"-->
        <!--                    >-->
        <!--                        <v-text-field-->
        <!--                            id="step-center-3d-0"-->
        <!--                            :value="step.navigation3D.cameraPosition[0] || cesiumScene.camera.position[0]"-->
        <!--                            disabled-->
        <!--                            outlined-->
        <!--                            dense-->
        <!--                            class="vue-text-all-top small-fieldset"-->
        <!--                            :class="{'positon_change': step.is3D && cesiumEnabled && isCameraPositionDifferent()}"-->
        <!--                            :label="t(-->
        <!--                                'additional:modules.dataNarrator.label.longitude'-->
        <!--                            )"-->
        <!--                            :title="t(-->
        <!--                                'additional:modules.dataNarrator.label.longitude'-->
        <!--                            )"-->
        <!--                            hide-details-->
        <!--                        />-->
        <!--                    </v-col>-->
        <!--                    <v-col-->
        <!--                        cols="3"-->
        <!--                        class="d-flex align-self-center mr-2"-->
        <!--                    >-->
        <!--                        <v-text-field-->
        <!--                            id="step-center-3d-1"-->
        <!--                            :value="step.navigation3D.cameraPosition[1] || cesiumScene.camera.position[1]"-->
        <!--                            disabled-->
        <!--                            outlined-->
        <!--                            dense-->
        <!--                            class="vue-text-all-top small-fieldset"-->
        <!--                            :class="{'positon_change': step.is3D && cesiumEnabled && isCameraPositionDifferent()}"-->
        <!--                            :label="t(-->
        <!--                                'additional:modules.dataNarrator.label.latitude'-->
        <!--                            )"-->
        <!--                            :title="t(-->
        <!--                                'additional:modules.dataNarrator.label.latitude'-->
        <!--                            )"-->
        <!--                            hide-details-->
        <!--                        />-->
        <!--                    </v-col>-->
        <!--                    <v-col-->
        <!--                        cols="3"-->
        <!--                        class="d-flex align-self-center"-->
        <!--                    >-->
        <!--                        <v-text-field-->
        <!--                            id="step-center-3d-2"-->
        <!--                            :value="step.navigation3D.cameraPosition[2] || cesiumScene.camera.position[2]"-->
        <!--                            :class="{'positon_change': step.is3D && cesiumEnabled && isCameraPositionDifferent()}"-->
        <!--                            disabled-->
        <!--                            outlined-->
        <!--                            dense-->
        <!--                            class="vue-text-all-top small-fieldset"-->
        <!--                            :label="t(-->
        <!--                                'additional:modules.dataNarrator.label.height'-->
        <!--                            )"-->
        <!--                            :title="t(-->
        <!--                                'additional:modules.dataNarrator.label.height'-->
        <!--                            )"-->
        <!--                            hide-details-->
        <!--                        />-->
        <!--                    </v-col>-->

        <!--                    <v-col-->
        <!--                        cols="1"-->
        <!--                        class="d-flex justify-center align-self-start"-->
        <!--                    >-->
        <!--                        <v-btn-->
        <!--                            icon-->
        <!--                            :title="-->
        <!--                                t(-->
        <!--                                    'additional:modules.dataNarrator.label.centerCoordinate'-->
        <!--                                )-->
        <!--                            "-->

        <!--                            @click="step.navigation3D.cameraPosition = get3DMapCenter()['cameraPosition']"-->
        <!--                        >-->
        <!--                            <v-icon>{{ mdiPinOutline }}</v-icon>-->
        <!--                        </v-btn>-->
        <!--                    </v-col>-->
        <!--                </v-row>-->

        <TwoDNavigation />
        <!--                <v-row-->
        <!--                    v-if="(!step.is3D && step.centerCoordinate && step.centerCoordinate !== center())-->
        <!--                        || (!step.is3D && step.zoomLevel && step.zoomLevel !== zoom())-->
        <!--                        || (step.is3D && ( cesiumEnabled && isCameraPositionDifferent())-->
        <!--                            || (mapMovedPosition.heading && step.navigation3D.heading && step.navigation3D.heading !== mapMovedPosition.heading)-->
        <!--                            || (mapMovedPosition.pitch && step.navigation3D.pitch && step.navigation3D.pitch !== mapMovedPosition.pitch))"-->
        <!--                    class="ma-0 pa-0 mb-2"-->
        <!--                >-->
        <!--                    <v-col-->
        <!--                        cols="12"-->
        <!--                        class="d-flex justify-center align-self-center"-->
        <!--                    >-->
        <!--                        <p-->
        <!--                            class="text-warning"-->
        <!--                        >-->
        <!--                            <small>-->
        <!--                                {{ t( "additional:modules.dataNarrator.warning.mapMoved" ) }} {{ step.is3D }}-->
        <!--                            </small>-->
        <!--                        </p>-->
        <!--                    </v-col>-->
        <!--                </v-row>-->
        <!--                <v-row class="mb-2">-->
        <!--                    <v-col-->
        <!--                        cols="12"-->
        <!--                        class="d-flex justify-center align-self-center"-->
        <!--                    >-->
        <!--                        <BackgroundMap-->
        <!--                            :selected-id="backgroundMapId"-->
        <!--                            :background-maps="backgroundMaps"-->
        <!--                            @update:background-map-id="setBackgroundMap"-->
        <!--                        />-->
        <!--                    </v-col>-->
        <!--                </v-row>-->
        <!--                <v-row>-->
        <!--                    <v-col-->
        <!--                        cols="12"-->
        <!--                        class="d-flex justify-center align-self-center"-->
        <!--                    >-->
        <!--                        <LayerSelectedPreview-->
        <!--                            :selected-layers="getSelectedLayers(step.layers, allLayerOptions.plainLayers)"-->
        <!--                            :selected.sync="step.layers"-->
        <!--                        />-->
        <!--                    </v-col>-->
        <!--                </v-row>-->
        <!--                <v-row class="mb-2">-->
        <!--                    <v-col-->
        <!--                        cols="12"-->
        <!--                        class="d-flex justify-center align-self-center"-->
        <!--                    >-->
        <!--                        <LayerSelectedPreview-->
        <!--                            :selected-layers="getSelectedLayers(step.layers3D, allLayerOptions.layers3D)"-->
        <!--                            :selected.sync="step.layers3D"-->
        <!--                        />-->
        <!--                    </v-col>-->
        <!--                </v-row>-->
      </div>

      <!-- todo: checkbox wird nicht mehr gebraucht oder? -->
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
      <!--            <v-expansion-panels-->
      <!--                id="advanced-options"-->
      <!--                class="expansion-panels"-->
      <!--                elevation="1"-->
      <!--            >-->
      <!--                <v-expansion-panel>-->
      <!--                    <v-expansion-panel-header>-->
      <!--                        {{-->
      <!--                            t("additional:modules.dataNarrator.label.ownDatasource")-->
      <!--                        }}-->
      <!--                    </v-expansion-panel-header>-->
      <!--                    <v-expansion-panel-content>-->
      <!--                        <div class="form-group">-->
      <!--                            <v-expansion-panels-->
      <!--                                v-if="rawDatasources.length > 0"-->
      <!--                                id="step-layer"-->
      <!--                                class="expansion-panels"-->
      <!--                                dense-->
      <!--                                nav-->
      <!--                                elevation="1"-->
      <!--                            >-->
      <!--                                <v-expansion-panel-->
      <!--                                    v-for="(item) in rawDatasources"-->
      <!--                                    :key="item.key"-->
      <!--                                    color="primary"-->
      <!--                                >-->
      <!--                                    <v-expansion-panel-header>-->
      <!--                                        <v-list-item-title>{{ item.name }}</v-list-item-title>-->
      <!--                                    </v-expansion-panel-header>-->
      <!--                                    <v-expansion-panel-content>-->
      <!--                                        <v-icon-->
      <!--                                            color="grey lighten-1"-->
      <!--                                            @click="removeDatasource(item)"-->
      <!--                                        >-->
      <!--                                            {{ mdiClose }}-->
      <!--                                        </v-icon>-->
      <!--                                    </v-expansion-panel-content>-->
      <!--                                </v-expansion-panel>-->
      <!--                            </v-expansion-panels>-->

      <!--                            <v-row class="mb-2">-->
      <!--                                <v-col-->
      <!--                                    cols="12"-->
      <!--                                >-->
      <!--                                    <v-file-input-->
      <!--                                        id="own_dataSource"-->
      <!--                                        ref="own_dataSource_input"-->
      <!--                                        multiple-->
      <!--                                        :label="t(-->
      <!--                                            'additional:modules.dataNarrator.label.ownDatasource'-->
      <!--                                        )"-->
      <!--                                        name="ownDataSource"-->
      <!--                                        accept=".kml, .geojson, .json, .gpx"-->
      <!--                                        @change="onCustomDataUpload"-->
      <!--                                    />-->
      <!--                                </v-col>-->
      <!--                            </v-row>-->
      <!--                            <v-row class="mb-2">-->
      <!--                                <v-col-->
      <!--                                    cols="6"-->
      <!--                                    offset="3"-->
      <!--                                    class="d-flex justify-center align-self-center"-->
      <!--                                >-->
      <!--                                    <v-btn-->
      <!--                                        class="add-btn add-data-btn"-->
      <!--                                        small-->
      <!--                                        @click="toggleDrawTool"-->
      <!--                                    >-->
      <!--                                        <v-icon left>-->
      <!--                                            {{ mdiPencilOutline }}-->
      <!--                                        </v-icon>-->
      <!--                                        {{ t( "additional:modules.dataNarrator.label.openDrawTool" ) }}-->
      <!--                                    </v-btn>-->
      <!--                                </v-col>-->
      <!--                                <v-col-->
      <!--                                    offset="2"-->
      <!--                                    cols="1"-->
      <!--                                    class="d-flex justify-center align-self-center"-->
      <!--                                >-->
      <!--                                    <v-tooltip top>-->
      <!--                                        <template #activator="{ on }">-->
      <!--                                            <v-icon-->
      <!--                                                dense-->
      <!--                                                small-->
      <!--                                                v-on="on"-->
      <!--                                            >-->
      <!--                                                {{ mdiHelpCircleOutline }}-->
      <!--                                            </v-icon>-->
      <!--                                        </template>-->
      <!--                                        <span>-->
      <!--                                            {{ t("additional:modules.dataNarrator.dashboardView.drawToolDescription") }}-->
      <!--                                        </span>-->
      <!--                                    </v-tooltip>-->
      <!--                                </v-col>-->
      <!--                            </v-row>-->

      <!--                            <v-expansion-panels-->
      <!--                                id="step-layer"-->
      <!--                                class="expansion-panels"-->
      <!--                                dense-->
      <!--                                nav-->
      <!--                                elevation="1"-->
      <!--                            >-->
      <!--                                <v-expansion-panel-->
      <!--                                    v-for="(item, index) in allWmsLayers"-->
      <!--                                    :key="index"-->
      <!--                                    color="primary"-->
      <!--                                >-->
      <!--                                    <v-expansion-panel-header>-->
      <!--                                        <v-list-item-title>{{ item.url }}</v-list-item-title>-->
      <!--                                    </v-expansion-panel-header>-->
      <!--                                    <v-expansion-panel-content>-->
      <!--                                        <v-treeview-->
      <!--                                            :key="`wmsLayers${index}${key}`"-->
      <!--                                            :selected="wmsLayers.map(({url, selectedLayers}) => url === item.url ? selectedLayers : [])"-->
      <!--                                            selectable-->
      <!--                                            :items="item.selectedLayers"-->
      <!--                                            item-key="Name"-->
      <!--                                            item-text="Title"-->

      <!--                                            @input="updateSelectedCapabilities($event, item.url, item.selectedLayers)"-->
      <!--                                        />-->
      <!--                                        &lt;!&ndash; <WmsCapabilitiesSelector-->
      <!--                                                        :items="capabilityOptions(item.url)"-->
      <!--                                                        :selected.sync="item.selectedLayers"-->
      <!--                                                    /> &ndash;&gt;-->
      <!--                                        <v-icon-->
      <!--                                            color="grey lighten-1"-->
      <!--                                            @click="onWmsLayerRemove(item)"-->
      <!--                                        >-->
      <!--                                            {{ mdiClose }}-->
      <!--                                        </v-icon>-->
      <!--                                    </v-expansion-panel-content>-->
      <!--                                </v-expansion-panel>-->
      <!--                            </v-expansion-panels>-->
      <!--                            <v-row class="mb-1">-->
      <!--                                <v-col>-->
      <!--                                    <v-text-field-->
      <!--                                        id="own_wmsLayers"-->
      <!--                                        ref="own_wmsLayers_input"-->
      <!--                                        name="ownWms"-->
      <!--                                        outlined-->
      <!--                                        dense-->
      <!--                                        class="vue-text-all-top small-fieldset"-->
      <!--                                        :label="t(-->
      <!--                                            'additional:modules.dataNarrator.label.ownWmsLayers'-->
      <!--                                        )"-->
      <!--                                        :title="t(-->
      <!--                                            'additional:modules.dataNarrator.label.ownWmsLayers'-->
      <!--                                        )"-->
      <!--                                        hide-details-->
      <!--                                        @change="onWmsLayersAdd"-->
      <!--                                    />-->
      <!--                                </v-col>-->
      <!--                            </v-row>-->

      <!--                            <v-row class="mb-2">-->
      <!--                                <v-col-->
      <!--                                    cols="12"-->
      <!--                                    class="d-flex justify-center align-self-center"-->
      <!--                                >-->
      <!--                                    <v-btn-->
      <!--                                        class="add-btn add-data-tool-btn"-->
      <!--                                        small-->
      <!--                                        @click="open3D"-->
      <!--                                    >-->
      <!--                                        <v-icon left>-->
      <!--                                            {{ mdiHomePlusOutline }}-->
      <!--                                        </v-icon>-->
      <!--                                        {{ t( "additional:modules.dataNarrator.label.threeDFiles" ) }}-->
      <!--                                    </v-btn>-->
      <!--                                </v-col>-->
      <!--                            </v-row>-->
      <!--                        </div>-->
      <!--                    </v-expansion-panel-content>-->
      <!--                </v-expansion-panel>-->
      <!--            </v-expansion-panels>-->

      <!--            <v-expansion-panels-->
      <!--                id="advanced-options"-->
      <!--                class="expansion-panels"-->
      <!--            >-->
      <!--                <v-expansion-panel>-->
      <!--                    <v-expansion-panel-header>-->
      <!--                        {{-->
      <!--                            t("additional:modules.dataNarrator.label.advancedOptions")-->
      <!--                        }}-->
      <!--                    </v-expansion-panel-header>-->
      <!--                    <v-expansion-panel-content>-->
      <!--                        <div class="form-group">-->
      <!--                            <label-->
      <!--                                class="form-label"-->
      <!--                                for="step-width"-->
      <!--                            >-->
      <!--                                {{ t("additional:modules.dataNarrator.label.stepWidth") }}-->
      <!--                            </label>-->

      <!--                            <input-->
      <!--                                id="step-width"-->
      <!--                                class="form-control"-->
      <!--                                type="number"-->
      <!--                                :value="step.stepWidth"-->
      <!--                                :min="minStepWidth"-->
      <!--                                :max="maxStepWidth"-->
      <!--                                step="10"-->
      <!--                                @change="onChangeStepWidth"-->
      <!--                            >-->
      <!--                        </div>-->
      <!--                        <div class="form-group">-->
      <!--                            <label-->
      <!--                                class="form-label"-->
      <!--                                for="step-addons"-->
      <!--                            >-->
      <!--                                {{ t( "additional:modules.dataNarrator.label.interactionAddons" ) }}-->
      <!--                            </label>-->
      <!--                            <v-select-->
      <!--                                id="step-addons"-->
      <!--                                v-model="step.interactionAddons"-->
      <!--                                :items="addonOptions"-->
      <!--                                multiple-->
      <!--                                dense-->
      <!--                                solo-->
      <!--                                hide-details-->
      <!--                            />-->
      <!--                        </div>-->
      <!--                    </v-expansion-panel-content>-->
      <!--                </v-expansion-panel>-->
      <!--            </v-expansion-panels>-->

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
              <!--                            <span>-->
              <!--                                {{-->
              <!--                                    t(editedStep-->
              <!--                                        ? "additional:modules.dataNarrator.button.submitEditStep"-->
              <!--                                        : "additional:modules.dataNarrator.button.submitAddStep")-->
              <!--                                }}-->
              <!--                            </span>-->
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
              <!--                            <span>-->
              <!--                                {{-->
              <!--                                    t(editedStep-->
              <!--                                        ? "additional:modules.dataNarrator.button.submitEditStep"-->
              <!--                                        : "additional:modules.dataNarrator.button.submitAddStep")-->
              <!--                                }}-->
              <!--                            </span>-->
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
