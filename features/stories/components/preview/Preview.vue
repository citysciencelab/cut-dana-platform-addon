<script setup>
import { useTranslation } from 'i18next-vue';

import PreviewModal from './PreviewModal.vue';

const { t } = useTranslation();
const open = defineModel('open', { type: Object, default: false });
const { chapters, hasImage } = defineProps({
  hasImage: Boolean,
  chapters: { type: Object, required: true }
});
</script>

<template>
  <PreviewModal
    v-model:open="open"
    :has-image="hasImage"
  >
    <div>
      <ol>
        <li
          v-for="(chapter, cIdx) in chapters"
          :key="chapter.id"
        >
          <div>
            <strong>{{ t('additional:modules.dataNarrator.preview.chapter') }} {{ cIdx + 1 }}:</strong>
            {{ chapter.title }}
          </div>

          <ol>
            <li v-if="!chapter.steps?.length">
              {{ t('additional:modules.dataNarrator.preview.noSteps') }}
            </li>

            <li
              v-for="(step, sIdx) in chapter.steps"
              :key="step.id"
            >
              <div>
                <strong>{{ t('additional:modules.dataNarrator.preview.step') }} {{ sIdx + 1 }}:</strong>
                {{ step.title || t('additional:modules.dataNarrator.preview.noTitle') }}
              </div>
              <ul>
                <li v-if="step.description">
                  {{ step.description }}
                </li>
                <li>{{ t('additional:modules.dataNarrator.preview.zoom') }}: {{ step.mapConfig?.zoomLevel ?? 0 }}</li>
                <li>
                  {{ t('additional:modules.dataNarrator.preview.center') }}: {{
                    (step.mapConfig?.centerCoordinates ?? []).join(", ")
                  }}
                </li>
                <li>{{ t('additional:modules.dataNarrator.preview.backgroundMap') }}: {{ step.mapConfig?.backgroundMapId ?? "—" }}</li>
                <li>
                  {{ t('additional:modules.dataNarrator.preview.informationLayers') }}: {{
                    (step.informationLayers ?? []).length
                  }}
                </li>
              </ul>
            </li>
          </ol>
        </li>
      </ol>
    </div>
  </PreviewModal>
</template>
