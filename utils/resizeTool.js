
const defaultTemplatePadding = 20;

/**
 * Calculates the padding for the tool window
 * @param {Number} innerWidth the width of the window
 * @returns {Number} the padding
 */
function sidePadding (innerWidth) {
    if (innerWidth > 1400) {
        return innerWidth * 0.15;
    }
    else if (innerWidth > 1200) {
        return innerWidth * 0.1;
    }
    else if (innerWidth > 992) {
        return innerWidth * 0.05;
    }
    return 20;
}

/**
 * Calculates the width for the tool window
 * @param {Number} innerWidth the width of the window
 * @returns {Number} the width
 */
function toolWidth (innerWidth) {
    if (innerWidth > 1400) {
        return innerWidth * 0.7;
    }
    else if (innerWidth > 1200) {
        return innerWidth * 0.8;
    }
    else if (innerWidth > 992) {
        return innerWidth * 0.9;
    }
    // mobile view on 768
    return innerWidth - 40;
}

/**
 * Resizes window for dashboard and return back to the original size
 *
 * @param {Boolean} doResize true if we want to resize the window
 * @param {Number} initialWidth initial width of the window (from the config)
 * @returns {void}
 */
export default function resizeTool (doResize, initialWidth) {

    const toolWindow = document.querySelectorAll(".tool-window-vue, .table-tool-win-all-vue")[0],

        width = doResize ? toolWidth(window.innerWidth) : initialWidth,
        padding = doResize ? sidePadding(window.innerWidth) : defaultTemplatePadding;

    toolWindow?.style?.setProperty("--initialToolWidth", `${width}px`, "important");
    toolWindow?.style?.setProperty("--currentPadding", `${padding}px`, "important");
}
