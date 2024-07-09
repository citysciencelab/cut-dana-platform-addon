import {stepPalette} from "../store/constantsDataNarrator";
import AlphanumericEncoder from "alphanumeric-encoder";

const defaultTemplatePadding = 20;

export default {
    data () {
        return {
            encoder: new AlphanumericEncoder()
        };
    },
    methods: {

        /**
         * Returns a color for a chapter number.
         * @param {number} chapterNumber the chapter number
         * @returns {string} color
         */
        colorFor (chapterNumber) {
            const index = (chapterNumber - 1) % stepPalette.length;

            return stepPalette[index];
        },

        /**
         * Calculates the padding for the tool window
         * @param {Number} innerWidth the width of the window
         * @returns {Number} the padding
         */
        sidePadding (innerWidth) {
            if (innerWidth > 1400) {
                return innerWidth * 0.15;
            }
            else if (innerWidth > 1200) {
                return innerWidth * 0.1;
            }
            else if (innerWidth > 992) {
                return innerWidth * 0.05;
            }
            return defaultTemplatePadding;
        },

        /**
         * Calculates the width for the tool window
         * @param {Number} innerWidth the width of the window
         * @returns {Number} the width
         */
        toolWidth (innerWidth) {
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
            return innerWidth - (defaultTemplatePadding * 2);
        },

        /**
         * Resizes window for dashboard and return back to the original size
         *
         * @param {Boolean} doResize true if we want to resize the window
         * @param {Number} initialWidth initial width of the window (from the config)
         * @returns {void}
         */
        resizeTool (doResize, initialWidth) {
            const toolWindow = document.querySelectorAll(".tool-window-vue, .table-tool-win-all-vue")[0],

                width = doResize ? this.toolWidth(window.innerWidth) : initialWidth,
                padding = doResize ? this.sidePadding(window.innerWidth) : defaultTemplatePadding;

            toolWindow?.style?.setProperty("--initialToolWidth", `${width}px`, "important");
            toolWindow?.style?.setProperty("--currentPadding", `${padding}px`, "important");
        },

        /**
         * Returns the letter(s) representing the chapter number.
         * @param {Number} chapterNumber the chapter number
         * @returns {String} letter(s) for the chapter number
         */
        chapterLetter (chapterNumber) {
            return this.encoder.encode(chapterNumber);
        }
    }
};
