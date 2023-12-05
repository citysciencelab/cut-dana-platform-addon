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
        <v-row>
            <v-col
                cols="1"
                class="chip-column"
            >
                <v-chip
                    class="vertical-chip"
                    :color="colorFor(step.associatedChapter).main"
                    outlined
                    pill
                >
                    {{ step.stepNumber }}
                </v-chip>
            </v-col>

            <v-col
                class="step-title"
                cols="11"
            >
                {{ step.title }}
            </v-col>
        </v-row>


        <div
            class="step-body"
            v-html="step.html"
        />
    </div>
</template>

<style scoped lang="scss">
.vertical-chip {
  padding: 0 6px;
  font-weight: bold;
  margin-right: 6px;
}

.chip-column {
  display: flex;
  align-content: center;
  justify-content: end;
  flex-wrap: wrap;
}

.step-title {
  font-weight: bold;
  font-size: 1.2em;
  align-content: center;
  justify-content: start;
  display: inline-flex;
  flex-wrap: wrap;
}

.step-body {
  margin-top: 10px;
}
</style>
