<script setup>
import { useTranslation } from 'i18next-vue';
import { computed, ref } from 'vue';
import { VueEditor } from 'vue3-editor';

import * as constants from '../../../../store/contantsDataNarrator';
import { backendUrl } from '../../../../store/contantsDataNarrator';
import { fixLinksInHTMLString } from '../../../../utils/stringUtils';

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  error: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits([ 'update:value' ]);
const inputValue = computed({
  get() {
    return props.value
  },
  set(v) {
    emit('update:value', fixLinksInHTMLString(v))
  }
});

const editorRef = ref(null);

defineExpose({
  focus() {
    // Quill editor element is inside the vue-editor wrapper
    const ql = editorRef.value?.$el?.querySelector('.ql-editor');
    ql?.focus();
  }
});

const { t } = useTranslation();

function getQuill() {
  return editorRef.value?.quill ?? null;
}

/**
 * Uploads an image File to the backend file storage and returns the URL
 * that can be embedded in the editor content.
 */
async function uploadImageFile(file) {
  const form = new FormData();
  form.append('files', file);
  const resp = await fetch(`${backendUrl}/files/story-images`, {
    method: 'POST',
    body: form,
  });
  if (!resp.ok) {
    throw new Error(`Image upload failed: ${resp.status}`);
  }
  const data = await resp.json();
  return `${backendUrl}/files/${data.fileContext}/${data.filename}`;
}

/**
 * Custom Quill image handler: opens a file picker, uploads to the backend,
 * then inserts a URL-based <img> — no base64 in the editor content.
 */
function handleImageUpload() {
  const quill = getQuill();
  if (!quill) return;

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.click();

  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;

    const range = quill.getSelection(true);
    // Insert a temporary placeholder so the cursor doesn't jump
    quill.insertText(range.index, t('additional:modules.dataNarrator.editor.uploadingImage'), { color: '#999' });

    try {
      const url = await uploadImageFile(file);
      // Remove placeholder text and insert the image
      quill.deleteText(range.index, t('additional:modules.dataNarrator.editor.uploadingImage').length);
      quill.insertEmbed(range.index, 'image', url);
      quill.setSelection(range.index + 1);
    } catch (err) {
      quill.deleteText(range.index, t('additional:modules.dataNarrator.editor.uploadingImage').length);
      console.error('Image upload failed:', err);
    }
  };
}

function onEditorReady(quill) {
  // Override the default image handler which embeds base64
  const toolbar = quill.getModule('toolbar');
  if (toolbar) {
    toolbar.addHandler('image', handleImageUpload);
  }
}
</script>

<template>
  <div :class="['editor-wrapper', { 'editor-error': error }]">
    <vue-editor
      ref="editorRef"
      v-model="inputValue"
      :placeholder="t('additional:modules.dataNarrator.label.htmlContent')"
      :editor-toolbar="constants.htmlEditorToolbar"
      @ready="onEditorReady"
    />
  </div>
</template>

<style lang="scss">
.editor-wrapper {
  .quillWrapper {
    display: flex;
    flex-direction: column-reverse;

    .ql-container {
      border: 1px solid #ccc !important;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      border-bottom: 0 !important;
    }

    .ql-container .ql-editor {
      min-height: 80px;
    }

    .ql-tooltip {
      // override computed left style from thirdparty lib
      left: 15px !important;
    }

    .ql-toolbar {
      border-top: 0;
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
    }
  }
}

.editor-error {
  .ql-container {
    border-color: #d32f2f !important;
  }
  .ql-toolbar {
    border-color: #d32f2f !important;
  }
}
</style>
