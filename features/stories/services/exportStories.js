import { backendUrl } from '../../../store/contantsDataNarrator';

/**
 * Export all stories to a JSON file
 * @param {Array} stories - Array of story objects to export
 */
export function exportStories(stories) {
  // Map stories to the export format
  const exportData = stories.map(story => {
    // Helper function to get file URL
    const getFileUrl = (file) => {
      if (!file) return null;
      return `${backendUrl}/files/${file.fileContext}/${file.filename}`;
    };

    // Map chapters and steps
    const mappedChapters = (story.chapters || []).map(chapter => ({
      sequence: chapter.sequence,
      name: chapter.name,
      steps: (chapter.steps || []).map(step => ({
        title: step.title,
        html: step.html,
        centerCoordinate: step.centerCoordinate,
        zoomLevel: step.zoomLevel,
        backgroundMapId: step.backgroundMapId,
        informationLayers: step.informationLayers,
        geoJsonAssets: step.geoJsonAssets,
        mapSources: step.mapSources,
        is3D: step.is3D ?? false,
        navigation3D: step.navigation3D ?? {},
        models3D: Array.isArray(step.models3D) ? step.models3D : [],
        layers3D: Array.isArray(step.layers3D) ? step.layers3D : [],
      }))
    }));

    return {
      id: story.id,
      title: story.title,
      description: story.description,
      isDraft: story.isDraft,
      featured: story.featured,
      scrollytelling: story.scrollytelling,
      playerWidth: story.playerWidth,
      playerHeight: story.playerHeight,
      autoplayEnabled: story.autoplayEnabled,
      autoplayIntervalSec: story.autoplayIntervalSec,
      hideBackButton: story.hideBackButton,
      author: story.author,
      owner: story.owner,
      titleImage: story.titleImage ? getFileUrl(story.titleImage) : null,
      chapters: mappedChapters,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
    };
  });

  // Create JSON blob and download
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.download = `stories-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get a single story with full details for export
 * @param {string|number} storyId - The story ID
 * @returns {Promise<Object>} The story data
 */
export async function getStoryForExport(storyId) {
  const res = await fetch(`${backendUrl}/stories/new/${storyId}`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to load story ${storyId}: ${res.status} ${text}`);
  }
  return res.json();
}
