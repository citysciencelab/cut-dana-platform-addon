<script setup>
import PreviewModal from './PreviewModal.vue';

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
            <strong>Kapitel {{ cIdx + 1 }}:</strong>
            {{ chapter.title }}
          </div>

          <ol>
            <li v-if="!chapter.steps?.length">
              Keine Schritte
            </li>

            <li
              v-for="(step, sIdx) in chapter.steps"
              :key="step.id"
            >
              <div><strong>Schritt {{ sIdx + 1 }}:</strong> {{ step.title || "Ohne Titel" }}</div>
              <ul>
                <li v-if="step.description">
                  {{ step.description }}
                </li>
                <li>Zoom: {{ step.mapConfig?.zoomLevel ?? 0 }}</li>
                <li>
                  Center: {{
                    (step.mapConfig?.centerCoordinates ?? []).join(", ")
                  }}
                </li>
                <li>Hintergrundkarte: {{ step.mapConfig?.backgroundMapId ?? "—" }}</li>
                <li>
                  Informationsebenen: {{
                    (step.informationLayerIds ?? []).length
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
