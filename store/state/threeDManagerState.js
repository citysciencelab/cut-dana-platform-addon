
/**
 * an entity is an object that contains the following properties:
 * id: number,
 * name: string,
 * description: string,
 * entity: Cesium.Entity,
 */

const state = {
    importedEntities: [],
    selectedEntityId: null,

    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#25832", name: "EPSG:25832", projName: "utm"},
    projections: [],
    namedProjections: [],

    loading: false

};

export default state;
