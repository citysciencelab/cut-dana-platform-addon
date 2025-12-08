<script setup>
import {computed} from "vue";

const props = defineProps({
    modelValue: {type: Boolean, default: false},
    title: {type: String, default: "Confirm"},
    message: {type: String, default: "Are you sure?"},
    confirmText: {type: String, default: "Yes"},
    cancelText: {type: String, default: "Cancel"},
    destructive: {type: Boolean, default: false},
    width: {type: [Number, String], default: 420},
});

const emit = defineEmits(["update:modelValue", "confirm", "cancel"]);

const open = computed({
    get: () => props.modelValue,
    set: (v) => emit("update:modelValue", v),
});

function onConfirm() {
    emit("confirm");
    open.value = false;
}

function onCancel() {
    emit("cancel");
    open.value = false;
}
</script>

<template>
    <v-dialog v-model="open" :width="width" persistent>
        <v-card rounded="md" :title="title" :text="message">
            <template v-slot:actions>
                <v-btn variant="text" @click="onCancel">
                    {{ cancelText }}
                </v-btn>

                <v-btn :color="destructive ? 'error' : 'primary'" @click="onConfirm">
                    {{ confirmText }}
                </v-btn>
            </template>
        </v-card>
    </v-dialog>
</template>
