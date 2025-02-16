<script>
import NavigationMixins from "../../../mixins/NavigationMixins";
import {dataNarratorModes} from "../../../store/contantsDataNarrator";
import CreateStoryMixins from "../mixins/CreateStoryMixins";

export default {
    name: "CreateStoryHeader",
    mixins: [NavigationMixins, CreateStoryMixins],
    computed: {
        dataNarratorModes() {
            return dataNarratorModes
        }
    }
};
</script>

<template lang="html">
    <div class="createStory-header">
    </div>
</template>

<style scoped lang="scss">
.createStory-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 1rem;
    padding: .5rem 0;

    .button {
        border: 1px solid gray;
        border-radius: 9999rem;
        padding: 0.2rem .8rem;
    }
}
</style>
