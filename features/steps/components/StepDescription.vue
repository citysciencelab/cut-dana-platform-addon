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
    />
  </div>
</template>
<script setup>
import { useTranslation } from 'i18next-vue';
import { VueEditor } from 'vue3-editor';

import * as constants from '../../../store/contantsDataNarrator'
import { useStepForm } from '../hooks/useStepForm';

const { t } = useTranslation();
const { description, onAddImage, onRemoveImage } = useStepForm();
</script>
