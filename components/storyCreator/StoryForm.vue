<script>
import CreateStoryMixins from "../../mixins/CreateStoryMixins";

export default {
    name: 'StoryForm',
    mixins: [CreateStoryMixins],
};
</script>

<template>
  <form
      id="story-form"
      @submit.prevent="saveStory"
  >
    <input name="title" placeholder="title" v-model="title"/>
    <textarea name="description" placeholder="Description" v-model="description"/>
  </form>
</template>

<style scoped lang="scss">
#story-form {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
</style>
