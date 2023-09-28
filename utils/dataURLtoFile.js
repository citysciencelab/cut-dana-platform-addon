/**
 * Converts a base64 string to a file
 * @param {String} dataurl base64 string
 * @param {String} filename the name of the file
 * @returns {File} the file
 */
export default function dataURLtoFile (dataurl, filename) {
    const arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]);
    let n = bstr.length;

    /* eslint-disable one-var */
    // It depends on previous code, so it's not possible to move it to the top
    const u8arr = new Uint8Array(n);
    /* eslint-enable */

    while (n) {
        u8arr[n - 1] = bstr.charCodeAt(n - 1);
        n -= 1; // to make eslint happy
    }
    return new File([u8arr], filename, {type: mime});
}
