/**
 * Returns the MIME type corresponding to a given file extension.
 *
 * @param {string} extension - The file extension without the leading dot.
 * @returns {string} - The corresponding MIME type, or 'application/octet-stream' if the extension is not recognized.
 *
 * @example
 * const mimeType = getMimeTypeFromExtension('gpx');  // returns 'application/gpx+xml'
 */
export function getMimeTypeFromExtension (extension) {
    const mimeTypes = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "gif": "image/gif",
        "txt": "text/plain",
        "csv": "text/csv",
        "html": "text/html",
        "json": "application/json",
        "pdf": "application/pdf",
        "xml": "application/xml",
        "zip": "application/zip",
        "geojson": "application/geo+json",
        "kml": "application/vnd.google-earth.kml+xml",
        "gpx": "application/gpx+xml"
    // Add more mappings as needed
    };

    return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
}
