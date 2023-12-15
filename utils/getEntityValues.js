/**
 * Collects all the valuable information from the entity and returns them
 *
 * @param {String} entityId the id of the entity
 * @returns {Object} returns an object with the entity values
 */
export default function getEntityValues (entityId) {
    const viewer = mapCollection.getMap("3D"),
        entities = viewer.getDataSourceDisplay().defaultDataSource.entities,

        entity = entities.getById(entityId);

    if (!entity) {
        return {};
    }


    console.log("enitity", entity);
    return {
        position: getEntityPosition(entity),
        scale: getEntityScale(entity)
    };

}

/**
 * Returns the position of the entity in the correct format
 * @param {Object} entity the entity
 * @returns {Object} returns an object with the entity position
 */
function getEntityPosition (entity) {
    return {
        x: entity.position._value.x,
        y: entity.position._value.y,
        z: entity.position._value.z
    };
}

/**
 * Return the scale of the entityt in the correct format
 * @param {Object} entity the entity
 * @returns {number} returns number that represents the scale of the entity
 */
function getEntityScale (entity) {
    return parseFloat(entity.model.scale);
}
