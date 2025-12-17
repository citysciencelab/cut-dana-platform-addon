import { ref } from 'vue';

import { createChapter } from '../services/chapters';

import { useStoryForm } from './useStoryForm';

export function useChapter () {

  const { storyId } = useStoryForm();
  const chapterName = ref('');

  const chapters = ref([]);

  const addChapter = async () => {
    const newChapter = {
      name: chapterName.value,
      sequence: chapters.value.length
    }

    const response = await createChapter(storyId.value, newChapter);

    if (response.ok) {
      chapters.value.push(newChapter);
    }

    // send chapter to server, if success add to chapters
  }

  return {
    chapters,
    chapterName,
    addChapter
  }
}
