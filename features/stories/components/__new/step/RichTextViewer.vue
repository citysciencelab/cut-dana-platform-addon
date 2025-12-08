<script setup>
import { computed } from 'vue';
import { VueEditor } from 'vue3-editor';

const props = defineProps({
    modelValue: {
        type: String,
        required: true,
    }
});
const emit = defineEmits([ 'update:modelValue' ]);

const internalValue = computed({
    get: () => props.modelValue,
    set: v => emit('update:modelValue', v),
});

const viewerOptions = {
    modules: { toolbar: false },
    readOnly: true,
    theme: 'bubble',
};
</script>

<template>
  <div class="viewer">
    <vue-editor
      v-model="internalValue"
      :editor-options="viewerOptions"
      :editor-toolbar="[]"
      :disabled="true"
    />
  </div>
</template>

<style lang="scss" scoped>
.viewer {
    :deep(.ql-container),
    :deep(.ql-toolbar) {
        border: none !important;
    }

    :deep(.ql-editor) {
        padding: 0;
        min-height: 0;

        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
        }
    }
}
</style>
