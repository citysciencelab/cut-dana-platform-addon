<script>
import DataNarratorWindowMixins from "../../../mixins/DataNarratorWindowMixins";
import Toolwindow from "../../../components/ToolWindow/Toolwindow.vue";
import LoginMixin from "../../../mixins/LoginMixin";
import NavigationMixins from "../../../mixins/NavigationMixins";
import StepForm from "./StepForm.vue";

export default {
    name: "CreateStep",
    mixins: [DataNarratorWindowMixins, LoginMixin, NavigationMixins],
    components: {
        StepForm, Toolwindow
    },


};
</script>

<template>
    <Toolwindow>
        <template v-slot:header>

        </template>
        <template v-slot:default>
            <div id="tool-dataNarrator-creator-stepForm">
                <StepForm />
            </div>
        </template>
        <template v-slot:footer>
            <div class="actions-container">

            </div>
        </template>
    </Toolwindow>
</template>

<style scoped lang="scss">
.actions-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: .2rem;
}
</style>
