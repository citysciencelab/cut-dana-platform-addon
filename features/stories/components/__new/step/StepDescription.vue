<script setup>
import {useTranslation} from "i18next-vue";
import {VueEditor} from "vue3-editor";
import {computed} from "vue";

import * as constants from "../../../../../store/contantsDataNarrator";

const props = defineProps({
   value: String,
});
const emit = defineEmits(['update:value']);
const inputValue = computed({
    get() { return props.value },
    set(v) { emit('update:value', v) }
});

const {t} = useTranslation();
</script>

<template>
    <div class="editor-wrapper">
        <vue-editor
            :placeholder="t('additional:modules.dataNarrator.label.htmlContent')"
            :editor-toolbar="constants.htmlEditorToolbar"
            use-custom-image-handler
            v-model="inputValue"
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

        .ql-toolbar {
            border-top: 0;
            border-bottom-left-radius: 4px;
            border-bottom-right-radius: 4px;
        }
    }
}
</style>
