const { metadata_t, property_metadata_t } = require("../../../reflection/metadata");

module.exports = class InterfaceMethodNotImplementedError extends ReferenceError {

    /**
     * 
     * @param {metadata_t} hostTypeMeta 
     * @param {property_metadata_t} interfacePropMeta 
     */
    constructor(hostTypeMeta, interfacePropMeta) {

        super();
    }
}