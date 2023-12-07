/**
 * this action will update an item in the items array, these items
 * @param {Array} fileItems contain the data for the 3dFile selector
 * @param {String} itemId the Id of the item to be replaced
 * @param {Object} newItem  the new item to replace the old one
 * @returns {Array} the new items array
 */
export function replaceFileItem (fileItems, itemId, newItem) {
    // Create a copy of the items
    const itemsCopy = JSON.parse(JSON.stringify(fileItems));


    /**
     * Recursive function to update an item in the tree
     * @param {Array} items the items to search
     * @param {string} iId the id of the item
     * @param {*} nItem the new item to add
     * @returns {boolean} true if the item was added, false otherwise
     */
    function updateRecursive (items, iId, nItem) {
        for (let i = 0; i < items.length; i++) {

            if (items[i].id === iId) {

                items[i] = nItem;
                return true;
            }
            // If the item has children, recursively search them
            if (items[i].children && updateRecursive(items[i].children, iId, nItem)) {
                return true;
            }
        }
        return false;
    }

    // Use the copied items for recursive addition
    updateRecursive(itemsCopy, itemId, newItem);

    // Update the original items with the modified copy
    return itemsCopy;
}

/**
 * Recursive function to get an item from the tree
 * @param {Array} items the items to search
 * @param {string} itemId the id of the item
 * @returns {Object|null} the found item or null if not found
 */
export function getItemRecursive (items, itemId) {
    for (let i = 0; i < items.length; i++) {
        if (items[i].id === itemId) {
            return items[i];
        }
        // If the item has children, recursively search them
        if (items[i].children && items[i].children.length > 0) {
            const found = getItemRecursive(items[i].children, itemId);

            if (found) {
                return found;
            }
        }
    }
    return null;
}
