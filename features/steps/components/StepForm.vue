<script setup>
import {useTranslation} from "i18next-vue";

const saveStep = () => {
    console.log("Save step");
};

</script>

<template>
    <div id="tool-dataNarrator-creator-stepForm">
<!--        <form-->
<!--            id="step-form"-->
<!--            @submit.prevent="saveStep"-->
<!--        >-->
<!--            <div class="form-group">-->
<!--                <v-row-->
<!--                    v-if="step.associatedChapter"-->
<!--                    class="form-input-holder xs pr-4"-->
<!--                >-->
<!--                    <v-col-->
<!--                        cols="1"-->
<!--                        class="d-flex align-self-center"-->
<!--                    >-->
<!--                        <v-btn-->
<!--                            :key="step.associatedChapter"-->
<!--                            class="story-step-button pill-button horizontal chapter-indicator"-->
<!--                            :style="{backgroundColor: colorFor(step.associatedChapter).main}"-->
<!--                            icon-->
<!--                            :title="-->
<!--                                $t(-->
<!--                                    'additional:modules.tools.dataNarrator.label.chapter'-->
<!--                                )-->
<!--                            "-->
<!--                        >-->
<!--                            {{ chapterLetter(step.associatedChapter ) }}-->
<!--                        </v-btn>-->
<!--                    </v-col>-->

<!--                    <v-col-->
<!--                        cols="11"-->
<!--                        class="text-center chapter-title-holder"-->
<!--                    >-->
<!--                        <v-text-field-->
<!--                            id="chapter-title"-->
<!--                            v-model="step.chapterTitle"-->
<!--                            class="vue-text-all-top"-->
<!--                            :label="$t(-->
<!--                                'additional:modules.tools.dataNarrator.label.chapterTitle'-->
<!--                            )"-->
<!--                            :rules="stepNameRules"-->
<!--                            hide-details="auto"-->
<!--                        />-->
<!--                    </v-col>-->
<!--                </v-row>-->
<!--            </div>-->

<!--            <div class="form-group form-input-holder lg">-->
<!--                <v-row class="pr-3">-->
<!--                    <v-col-->
<!--                        cols="1"-->
<!--                        class="d-flex align-self-center "-->
<!--                    >-->
<!--                        <v-btn-->
<!--                            v-if="step.associatedChapter"-->
<!--                            class="story-step-button pill-button step-indicator"-->
<!--                            :style="{color: colorFor(step.associatedChapter).main}"-->
<!--                            icon-->
<!--                            :title="-->
<!--                                $t(-->
<!--                                    'additional:modules.tools.dataNarrator.label.stepNumber'-->
<!--                                )-->
<!--                            "-->
<!--                        >-->
<!--                            {{ step.stepNumber }}-->
<!--                        </v-btn>-->
<!--                    </v-col>-->
<!--                    <v-col-->
<!--                        cols="11"-->
<!--                        class="d-flex align-self-center step-title-holder"-->
<!--                    >-->
<!--                        <v-text-field-->
<!--                            id="step-title"-->
<!--                            v-model="step.title"-->
<!--                            class="vue-text-all-top"-->
<!--                            :label="$t(-->
<!--                                'additional:modules.tools.dataNarrator.label.stepTitle'-->
<!--                            )"-->
<!--                            :rules="stepNameRules"-->
<!--                            hide-details="auto"-->
<!--                        />-->
<!--                    </v-col>-->
<!--                </v-row>-->
<!--                <v-row class="mb-2">-->
<!--                    <v-col-->
<!--                        cols="12"-->
<!--                        class="d-flex align-self-center "-->
<!--                    >-->
<!--                        <div class="stepForm-inputs-htmlEditor">-->
<!--                            <VueEditor-->
<!--                                id="step-vue-editor"-->
<!--                                v-model="step.html"-->
<!--                                :placeholder="$t('additional:modules.tools.dataNarrator.label.htmlContent')"-->
<!--                                :editor-toolbar="constants.htmlEditorToolbar"-->
<!--                                use-custom-image-handler-->
<!--                                @image-added="onAddImage"-->
<!--                                @image-removed="onRemoveImage"-->
<!--                            />-->
<!--                        </div>-->
<!--                    </v-col>-->
<!--                </v-row>-->
<!--                <v-row>-->
<!--                    <v-col-->
<!--                        cols="12"-->
<!--                        class="d-flex align-self-center"-->
<!--                    >-->
<!--                        <div class="vue-label-style">-->
<!--                            {{ $t( "additional:modules.tools.dataNarrator.label.mapDisplay" ) }}-->
<!--                        </div>-->
<!--                    </v-col>-->
<!--                </v-row>-->
<!--                &lt;!&ndash;                TODO: Hier kam vom Remote <div v-if="temp.is3D"> ist das wichtig? Löst das etwas&ndash;&gt;-->
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
<!--                            :value="step.navigation3D.heading"-->
<!--                            disabled-->
<!--                            outlined-->
<!--                            dense-->
<!--                            class="vue-text-all-top small-fieldset"-->
<!--                            :class="{'positon_change': mapMovedPosition.heading && step.navigation3D.heading && step.navigation3D.heading !== mapMovedPosition.heading}"-->
<!--                            :label="$t(-->
<!--                                'additional:modules.tools.dataNarrator.label.heading'-->
<!--                            )"-->
<!--                            :title="$t(-->
<!--                                'additional:modules.tools.dataNarrator.label.heading'-->
<!--                            )"-->
<!--                            hide-details-->
<!--                        />-->
<!--                    </v-col>-->
<!--                    <v-col-->
<!--                        cols="1"-->
<!--                        class="d-flex align-self-center mr-2"-->
<!--                    >-->
<!--                        <v-btn-->
<!--                            icon-->
<!--                            :title="-->
<!--                                $t(-->
<!--                                    'additional:modules.tools.dataNarrator.label.heading'-->
<!--                                )-->
<!--                            "-->
<!--                            @click="step.navigation3D.heading = get3DMapCenter()['heading']"-->
<!--                        >-->
<!--                            <v-icon>{{ icons.mdiPinOutline }}</v-icon>-->
<!--                        </v-btn>-->
<!--                    </v-col>-->
<!--                    <v-col-->
<!--                        cols="3"-->
<!--                        class="d-flex align-self-center"-->
<!--                    >-->
<!--                        <v-text-field-->
<!--                            id="step-center-3d-0"-->
<!--                            :value="step.navigation3D.pitch"-->
<!--                            disabled-->
<!--                            outlined-->
<!--                            dense-->
<!--                            class="vue-text-all-top small-fieldset"-->
<!--                            :class="{'positon_change': mapMovedPosition.pitch && step.navigation3D.pitch && step.navigation3D.pitch !== mapMovedPosition.pitch}"-->
<!--                            :label="$t(-->
<!--                                'additional:modules.tools.dataNarrator.label.pitch'-->
<!--                            )"-->
<!--                            :title="$t(-->
<!--                                'additional:modules.tools.dataNarrator.label.pitch'-->
<!--                            )"-->
<!--                            hide-details-->
<!--                        />-->
<!--                    </v-col>-->
<!--                    <v-col-->
<!--                        cols="1"-->
<!--                        class="d-flex align-self-center"-->
<!--                    >-->
<!--                        <v-btn-->
<!--                            icon-->
<!--                            :title="-->
<!--                                $t(-->
<!--                                    'additional:modules.tools.dataNarrator.label.pitch'-->
<!--                                )-->
<!--                            "-->

<!--                            @click="step.navigation3D.pitch = get3DMapCenter()['pitch']"-->
<!--                        >-->
<!--                            <v-icon>{{ icons.mdiPinOutline }}</v-icon>-->
<!--                        </v-btn>-->
<!--                    </v-col>-->
<!--                </v-row>-->

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
<!--                            :label="$t(-->
<!--                                'additional:modules.tools.dataNarrator.label.longitude'-->
<!--                            )"-->
<!--                            :title="$t(-->
<!--                                'additional:modules.tools.dataNarrator.label.longitude'-->
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
<!--                            :label="$t(-->
<!--                                'additional:modules.tools.dataNarrator.label.latitude'-->
<!--                            )"-->
<!--                            :title="$t(-->
<!--                                'additional:modules.tools.dataNarrator.label.latitude'-->
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
<!--                            :label="$t(-->
<!--                                'additional:modules.tools.dataNarrator.label.height'-->
<!--                            )"-->
<!--                            :title="$t(-->
<!--                                'additional:modules.tools.dataNarrator.label.height'-->
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
<!--                                $t(-->
<!--                                    'additional:modules.tools.dataNarrator.label.centerCoordinate'-->
<!--                                )-->
<!--                            "-->

<!--                            @click="step.navigation3D.cameraPosition = get3DMapCenter()['cameraPosition']"-->
<!--                        >-->
<!--                            <v-icon>{{ icons.mdiPinOutline }}</v-icon>-->
<!--                        </v-btn>-->
<!--                    </v-col>-->
<!--                </v-row>-->

<!--                <v-row-->
<!--                    v-if="!step.is3D"-->
<!--                    class="mb-2"-->
<!--                >-->
<!--                    <v-col-->
<!--                        cols="3"-->
<!--                        class="d-flex align-self-center pr-1"-->
<!--                    >-->
<!--                        <v-text-field-->
<!--                            id="step-center-lng"-->
<!--                            :key="`centerCoordinatex${key}`"-->
<!--                            v-model="step.centerCoordinate && step.centerCoordinate[0]"-->
<!--                            disabled-->
<!--                            outlined-->
<!--                            dense-->
<!--                            class="vue-text-all-top small-fieldset"-->
<!--                            :class="{'positon_change': step.centerCoordinate && step.centerCoordinate !== center()}"-->
<!--                            :label="$t(-->
<!--                                'additional:modules.tools.dataNarrator.label.longitude'-->
<!--                            )"-->
<!--                            :title="$t(-->
<!--                                'additional:modules.tools.dataNarrator.label.longitude'-->
<!--                            )"-->
<!--                            hide-details-->
<!--                        />-->
<!--                    </v-col>-->
<!--                    <v-col-->
<!--                        cols="3"-->
<!--                        class="d-flex align-self-center"-->
<!--                    >-->
<!--                        <v-text-field-->
<!--                            id="step-center-lat"-->
<!--                            :key="`centerCoordinatex${key}`"-->
<!--                            v-model="step.centerCoordinate && step.centerCoordinate[1]"-->
<!--                            disabled-->
<!--                            outlined-->
<!--                            dense-->
<!--                            class="vue-text-all-top small-fieldset"-->
<!--                            :class="{'positon_change': step.centerCoordinate && step.centerCoordinate !== center()}"-->
<!--                            :label="$t(-->
<!--                                'additional:modules.tools.dataNarrator.label.latitude'-->
<!--                            )"-->
<!--                            :title="$t(-->
<!--                                'additional:modules.tools.dataNarrator.label.latitude'-->
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
<!--                                $t(-->
<!--                                    'additional:modules.tools.dataNarrator.label.centerCoordinate'-->
<!--                                )-->
<!--                            "-->
<!--                            @click="() => {-->
<!--                                key++;-->
<!--                                step.centerCoordinate = center()-->
<!--                            }"-->
<!--                        >-->
<!--                            <v-icon>{{ icons.mdiPinOutline }}</v-icon>-->
<!--                        </v-btn>-->
<!--                    </v-col>-->
<!--                    <v-col-->
<!--                        cols="3"-->
<!--                        offset="1"-->
<!--                        class="d-flex align-self-center"-->
<!--                    >-->
<!--                        <v-text-field-->
<!--                            id="step-zoomlevel"-->
<!--                            v-model="step.zoomLevel"-->
<!--                            disabled-->
<!--                            outlined-->
<!--                            dense-->
<!--                            class="vue-text-all-top small-fieldset"-->
<!--                            :class="{'positon_change': step.zoomLevel && step.zoomLevel !== zoom()}"-->
<!--                            :label="$t(-->
<!--                                'additional:modules.tools.dataNarrator.label.zoomLevel'-->
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
<!--                                $t(-->
<!--                                    'additional:modules.tools.dataNarrator.label.setZoomLevel'-->
<!--                                )-->
<!--                            "-->
<!--                            @click="() => {-->
<!--                                key++;-->
<!--                                step.zoomLevel = zoom()-->
<!--                            }"-->
<!--                        >-->
<!--                            <v-icon>{{ icons.mdiPinOutline }}</v-icon>-->
<!--                        </v-btn>-->
<!--                    </v-col>-->
<!--                </v-row>-->
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
<!--                                {{ $t( "additional:modules.tools.dataNarrator.warning.mapMoved" ) }} {{ step.is3D }}-->
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
<!--            </div>-->

<!--            &lt;!&ndash; todo: checkbox wird nicht mehr gebraucht oder? &ndash;&gt;-->
<!--            <div-->
<!--                v-if="is3DLayerActive"-->
<!--                class="form-group"-->
<!--            >-->
<!--                <label-->
<!--                    class="form-label"-->
<!--                    for="step-is3d"-->
<!--                >-->
<!--                    {{ $t( "additional:modules.tools.dataNarrator.label.is3D" ) }}-->
<!--                </label>-->
<!--                <input-->
<!--                    id="step-is3d"-->
<!--                    v-model="step.is3D"-->
<!--                    class="checkbox"-->
<!--                    type="checkbox"-->
<!--                >-->
<!--            </div>-->

<!--            <v-row class="mb-3">-->
<!--                <v-col-->
<!--                    cols="12"-->
<!--                    class="d-flex justify-center align-self-center"-->
<!--                >-->
<!--                    <v-btn-->
<!--                        class="add-btn add-layer-btn"-->
<!--                        small-->
<!--                        @click="openLayerEditor"-->
<!--                    >-->
<!--                        <v-icon left>-->
<!--                            {{ icons.mdiMapMarkerPlusOutline }}-->
<!--                        </v-icon>-->
<!--                        {{ $t( "additional:modules.tools.dataNarrator.label.dataLayer" ) }}-->
<!--                    </v-btn>-->
<!--                </v-col>-->
<!--            </v-row>-->
<!--            <v-expansion-panels-->
<!--                id="advanced-options"-->
<!--                class="expansion-panels"-->
<!--                elevation="1"-->
<!--            >-->
<!--                <v-expansion-panel>-->
<!--                    <v-expansion-panel-header>-->
<!--                        {{-->
<!--                            $t("additional:modules.tools.dataNarrator.label.ownDatasource")-->
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
<!--                                            {{ icons.mdiClose }}-->
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
<!--                                        :label="$t(-->
<!--                                            'additional:modules.tools.dataNarrator.label.ownDatasource'-->
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
<!--                                            {{ icons.mdiPencilOutline }}-->
<!--                                        </v-icon>-->
<!--                                        {{ $t( "additional:modules.tools.dataNarrator.label.openDrawTool" ) }}-->
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
<!--                                                {{ icons.mdiHelpCircleOutline }}-->
<!--                                            </v-icon>-->
<!--                                        </template>-->
<!--                                        <span>-->
<!--                                            {{ $t("additional:modules.tools.dataNarrator.dashboardView.drawToolDescription") }}-->
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
<!--                                            {{ icons.mdiClose }}-->
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
<!--                                        :label="$t(-->
<!--                                            'additional:modules.tools.dataNarrator.label.ownWmsLayers'-->
<!--                                        )"-->
<!--                                        :title="$t(-->
<!--                                            'additional:modules.tools.dataNarrator.label.ownWmsLayers'-->
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
<!--                                            {{ icons.mdiHomePlusOutline }}-->
<!--                                        </v-icon>-->
<!--                                        {{ $t( "additional:modules.tools.dataNarrator.label.threeDFiles" ) }}-->
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
<!--                            $t("additional:modules.tools.dataNarrator.label.advancedOptions")-->
<!--                        }}-->
<!--                    </v-expansion-panel-header>-->
<!--                    <v-expansion-panel-content>-->
<!--                        <div class="form-group">-->
<!--                            <label-->
<!--                                class="form-label"-->
<!--                                for="step-width"-->
<!--                            >-->
<!--                                {{ $t("additional:modules.tools.dataNarrator.label.stepWidth") }}-->
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
<!--                                {{ $t( "additional:modules.tools.dataNarrator.label.interactionAddons" ) }}-->
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

<!--            <v-footer-->
<!--                class="tool-dataNarrator-creator-actions white"-->
<!--                elevation="2"-->
<!--                rounded-->
<!--            >-->
<!--                <v-card-->
<!--                    v-if="!mobile"-->
<!--                    flat-->
<!--                    tile-->
<!--                    width="100%"-->
<!--                    class="lighten-1 text-center"-->
<!--                >-->
<!--                    <v-card-text>-->
<!--                        <v-tooltip top>-->
<!--                            <template #activator="{ on }">-->
<!--                                <span-->
<!--                                    id="cancel-button"-->
<!--                                    class="mr-1"-->
<!--                                    v-on="on"-->
<!--                                >-->
<!--                                    <v-btn-->
<!--                                        class=""-->
<!--                                        icon-->
<!--                                        @click="$emit('return')"-->
<!--                                    >-->
<!--                                        <v-icon size="24px">{{ icons.mdiCancel }}</v-icon>-->
<!--                                    </v-btn>-->
<!--                                </span>-->
<!--                            </template>-->
<!--                            <span>-->
<!--                                {{ $t("additional:modules.tools.dataNarrator.button.cancel") }}-->
<!--                            </span>-->
<!--                        </v-tooltip>-->
<!--                        <v-tooltip top>-->
<!--                            <template #activator="{ on }">-->
<!--                                <span-->
<!--                                    id="delete-button"-->
<!--                                    class="mr-1"-->
<!--                                    v-on="on"-->
<!--                                >-->
<!--                                    <v-btn-->
<!--                                        class=""-->
<!--                                        icon-->
<!--                                        @click="onDeleteStep"-->
<!--                                    >-->
<!--                                        <v-icon size="24px">{{ icons.mdiTrashCanOutline }}</v-icon>-->
<!--                                    </v-btn>-->
<!--                                </span>-->
<!--                            </template>-->
<!--                            <span>-->
<!--                                {{ $t("additional:modules.tools.dataNarrator.button.deleteStep") }}-->
<!--                            </span>-->
<!--                        </v-tooltip>-->
<!--                        <v-tooltip top>-->
<!--                            <template #activator="{ on }">-->
<!--                                <span-->
<!--                                    id="save-button"-->
<!--                                    class="mr-1"-->
<!--                                    v-on="on"-->
<!--                                >-->
<!--                                    <v-btn-->
<!--                                        class=""-->
<!--                                        icon-->
<!--                                        :disabled="!isValid"-->
<!--                                        @click="onSubmit"-->
<!--                                    >-->

<!--                                        <v-icon size="24px">{{ icons.mdiCheck }}</v-icon>-->
<!--                                    </v-btn>-->
<!--                                </span>-->
<!--                            </template>-->
<!--                            <span>-->
<!--                                {{-->
<!--                                    $t(editedStep-->
<!--                                        ? "additional:modules.tools.dataNarrator.button.submitEditStep"-->
<!--                                        : "additional:modules.tools.dataNarrator.button.submitAddStep")-->
<!--                                }}-->
<!--                            </span>-->
<!--                        </v-tooltip>-->
<!--                    </v-card-text>-->
<!--                </v-card>-->
<!--                <v-container-->
<!--                    v-else-->
<!--                    fluid-->
<!--                    class="white"-->
<!--                >-->
<!--                    <v-row-->
<!--                        class="mb-2"-->
<!--                        no-gutters-->
<!--                    >-->
<!--                        <v-col>-->
<!--                            <v-btn-->
<!--                                class=""-->
<!--                                small-->
<!--                                color="red"-->
<!--                                min-width="100%"-->
<!--                                @click="$emit('return')"-->
<!--                            >-->
<!--                                <span>-->
<!--                                    {{ $t("additional:modules.tools.dataNarrator.button.cancel") }}-->
<!--                                </span>-->
<!--                            </v-btn>-->
<!--                        </v-col>-->
<!--                        <v-col>-->
<!--                            <v-btn-->
<!--                                class=""-->
<!--                                small-->
<!--                                color="red"-->
<!--                                min-width="100%"-->
<!--                                @click="onDeleteStep"-->
<!--                            >-->
<!--                                <span>{{ $t("additional:modules.tools.dataNarrator.button.deleteStep") }}</span>-->
<!--                            </v-btn>-->
<!--                        </v-col>-->
<!--                    </v-row>-->
<!--                    <v-row-->
<!--                        class="mb-2"-->
<!--                        no-gutters-->
<!--                    >-->
<!--                        <v-btn-->
<!--                            class=""-->
<!--                            small-->
<!--                            color="green"-->
<!--                            :disabled="!isValid"-->
<!--                            @click="onSubmit"-->
<!--                        >-->
<!--                            <span>-->
<!--                                {{-->
<!--                                    $t(editedStep-->
<!--                                        ? "additional:modules.tools.dataNarrator.button.submitEditStep"-->
<!--                                        : "additional:modules.tools.dataNarrator.button.submitAddStep")-->
<!--                                }}-->
<!--                            </span>-->
<!--                        </v-btn>-->
<!--                    </v-row>-->
<!--                </v-container>-->
<!--            </v-footer>-->

<!--            <v-alert-->
<!--                v-show="!isValid"-->
<!--                id="tool-dataNarrator-creator-noHTML"-->
<!--                type="info"-->
<!--            >-->
<!--                {{ $t("additional:modules.tools.dataNarrator.warning.sendNoHTML") }}-->
<!--            </v-alert>-->
<!--        </form>-->
    </div>
</template>

<style scoped lang="scss">

</style>
