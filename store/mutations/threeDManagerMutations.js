// all functions that mutate the state

/**
 * mutate the projections
 * @param {Object} state the state
 * @param {Object} payload the payload of the mutation
 * @param {Array} payload.projections the projections to set
 * @returns {void}
 */
function setProjections (state, payload) {
    state.projections = payload.projections;
}

/**
 * append to the importedEntities state array
 * @param {Object} state the state
 * @param {Object} payload the payload of the mutation
 * @param {Object} payload.entity the projections to set
 * @returns {void}
 */
function appendImportedEntities (state, payload) {
    state.importedEntities.push(payload.entity);
}

/**
 * mutate the projections
 * @param {Object} state the state
 * @param {Object} payload the payload of the mutation
 * @param {Boolean} payload.loading the loading state to set
 * @returns {void}
 */
function setLoadingState (state, payload) {
    state.loading = payload.loading;
}

/**
 * mutate the currentProjection
 * @param {Object} state the state
 * @param {Object} payload the payload of the mutation
 * @param {Boolean} payload.projection the projection to set
 * @returns {void}
 */
function setCurrentProjection (state, payload) {
    state.currentProjection = payload.projection;
}


/**
 * mutate the selectedEntity
 * @param {Object} state the state
 * @param {Object} payload the payload of the mutation
 * @param {Boolean} payload.selectedEntityId the selected entity to set
 * @returns {void}
 */
function setSelectedEntityId (state, payload) {
    console.log("payload", payload);
    state.selectedEntityId = payload.selectedEntityId;
    console.log("state", state);
}

export default {
    // importFile,
    // removeEntity,
    // toggleEntityVisibility,
    // changeEntityLocation,
    // changeEntityOrientation,
    // scaleEntity,
    // createEntity,
    // disableEntityVisibility,
    // disableAllEntities,
    // enableEntityVisibility,

    setProjections,
    appendImportedEntities,
    setLoadingState,
    setCurrentProjection,
    setSelectedEntityId
};
