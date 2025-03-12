<template>
  <div class="stepForm-inputs-htmlEditor">
    <vue-editor
        id="step-vue-editor"
        v-model="description"
        :placeholder="t('additional:modules.dataNarrator.label.htmlContent')"
        :editor-toolbar="constants.htmlEditorToolbar"
        use-custom-image-handler
        @image-added="onAddImage"
        @image-removed="onRemoveImage"
    ></vue-editor>
  </div>
</template>
<script setup>
import {useStepForm} from "../hooks/useStepForm";
import {VueEditor} from "vue3-editor";
import * as constants from "../../../store/contantsDataNarrator"
import {useTranslation} from "i18next-vue";

const {t} = useTranslation();
const { description, onAddImage, onRemoveImage } = useStepForm();
</script>
