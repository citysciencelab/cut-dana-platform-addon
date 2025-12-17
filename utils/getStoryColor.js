const STORY_COLORS = [
  {
    primary: '#413FAB',
    secondary: '#A3C4FF',
  },
  {
    primary: '#236051',
    secondary: '#72CD86',
  },
  {
    primary: '#893D05',
    secondary: '#FEE397',
  },
  {
    primary: '#584560',
    secondary: '#C2A7CD',
  },
]

export function getStoryColor(idx) {
  return STORY_COLORS[idx % STORY_COLORS.length];
}
