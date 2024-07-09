<script>

import RenderUtilities from "../../mixins/RenderUtilities";

export default {
    name: "PlayerContent",
    mixins: [RenderUtilities],
    props: {
        step: {
            type: Object,
            default: null
        }
    }
};
</script>

<template>
    <div>
        <v-row class="mt-5">
            <v-col
                cols="1"
                class="chip-column"
            >
                <v-btn
                    class="story-step-button pill-button step-indicator step-indicator-big"
                    :style="{color: colorFor(step.associatedChapter).main}"
                    icon
                    :title="
                        $t(
                            'additional:modules.tools.dataNarrator.label.stepNumber'
                        )
                    "
                >
                    {{ step.stepNumber }}
                </v-btn>
            </v-col>

            <v-col
                class="step-title"
                cols="11"
            >
                {{ step.title }}
            </v-col>
        </v-row>


        <div
            class="step-body mt-4 mb-5"
            v-html="step.html"
        />
    </div>
</template>

<style scoped lang="scss">

.chip-column {
  display: flex;
  align-content: center;
  justify-content: end;
  flex-wrap: wrap;
}

.step-title {
  font-weight: bold;
  font-size: 1.3em;
  align-content: center;
  justify-content: start;
  display: inline-flex;
  flex-wrap: wrap;
}

.step-body {
  margin-top: 10px;
}
</style>
