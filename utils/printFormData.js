
/**
 * Prints the contents of a FormData object as a table in the console.
 * Each row in the table represents a key-value pair from the FormData.
 *
 * @param {FormData} formData - The FormData object to be printed.
 * @returns {void}
 *
 * @example
 * // Assuming you have a FormData object named 'myFormData':
 * let myFormData = new FormData();
 * myFormData.append('key1', 'value1');
 * myFormData.append('key2', 'value2');
 * printFormDataAsTable(myFormData);
 *
 * @throws Will throw an error if the input is not a FormData object.
 */
export default function printFormDataAsTable (formData) {
    // Check if formData is indeed a FormData object
    if (!(formData instanceof FormData)) {
        console.error("Provided input is not a FormData object.");
        return;
    }

    // Create an array to store the table rows
    const table = [];

    for (const pair of formData.entries()) {
        table.push({
            key: pair[0],
            value: pair[1]
        });
    }


    console.table(table);
}
