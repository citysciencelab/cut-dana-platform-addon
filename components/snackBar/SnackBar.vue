<script>
export default {
    name: "SnackBar",
    data () {
        return {
            showSnackbar: false,
            message: "",
            color: "success",
            icon: "mdi-check",
            timer: 3000
        };
    },
    methods: {
        show (data) {
            this.message = data.message || "missing \"message\".";
            this.color = data.color || "primary";
            this.timer = data.timer || 3000;
            this.icon = data.icon || "mdi-check";
            this.showSnackbar = true;
        }
    }
};
</script>

<template>
    <v-snackbar
        v-model="showSnackbar"
        :color="color"
        :timeout="timer"
        bottom
    >
        <v-icon left>
            {{ icon }}
        </v-icon>
        {{ message }}
    </v-snackbar>
</template>
