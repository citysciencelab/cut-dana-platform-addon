/**
 * Disable all layers that are used in the story.
 * @param {Array} steps list of story steps
 * @returns {void}
 */
export default function disableStoryLayers (steps) {
    // Hides all story layers
    const layerList = Radio.request("ModelList", "getModelsByAttributes", {
        isVisibleInMap: true, isSelected: true
    });

    for (const step of steps) {
        if (step.layers === undefined) {
            continue;
        }
        for (const layer of step.layers) {
            if (typeof layer === "string") {
                const layerModel = layerList.find(l => l.attributes.id === layer);

                if (layerModel) {
                    layerModel.setIsVisibleInMap(false);
                    layerModel.set("isSelected", false);
                }
            }
            else {
                const layerModel = layerList.find(l => l.attributes.id === layer.id);

                if (layerModel) {
                    layerModel.setIsVisibleInMap(false);
                    layerModel.set("isSelected", false);
                }
            }
        }


        // for (const layer of layerList) {
        //     if (step.layers.map(l => l.id).includes(layer.attributes.id)) {
        //         layer.setIsVisibleInMap(false);
        //         layer.set("isSelected", false);
        //     }
        // }

    }

    Radio.trigger("Menu", "rerender");
}
