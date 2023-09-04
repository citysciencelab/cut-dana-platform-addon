import axios from "axios";

/**
 * Returns the reference to a story step
 *
 * @param {String} url the path of the story JSON
 * @returns {String} the loaded story file
 */
export default function fetchDataFromUrl (url) {
    return axios
        .get(url)
        .then(response => response.data)
        .then(content => content);
}

/**
 * Returns the reference to a story step
 *
 * @param {String} url the path of the story JSON
 * @param {Number} storyId the id of the story
 * @param {Object} currentStep contains information about the step to load
 * @returns {String} the loaded step content with working image file paths
 */
export function loadStepContent (url, storyId, currentStep) {
    // Fetch HTML from the server
    const loadStepContentURL =
            url +
            "step/" +
            storyId +
            "/" +
            currentStep.associatedChapter +
            "/" +
            currentStep.stepNumber +
            "/html",
        loadImageURL =
            url + "image/";

    return fetchDataFromUrl(loadStepContentURL)
        .then((data) => {
            let loadedContent = data;

            for (const matchAllElement of [...loadedContent.matchAll("src\s*=\s*\"([^\"]+)\"")]) {
                loadedContent = loadedContent.replace(matchAllElement[1], loadImageURL + matchAllElement[1]);
            }
            return loadedContent;
        });
}
