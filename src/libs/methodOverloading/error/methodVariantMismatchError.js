const { property_metadata_t } = require("../../../reflection/metadata");

module.exports = class MethodVariantMismatchError extends ReferenceError {

    #estimatedType;
    #propMeta;

    get estimatedTypes() {

        return this.#estimatedType;
    }

    get propMeta() {

        return this.#propMeta;
    }

    /**
     * 
     * @param {property_metadata_t} propMeta 
     * @param {Array<Function>} estimatedTypes 
     */
    constructor(propMeta, estimatedTypes = []) {

        super();

        this.#estimatedType = estimatedTypes;
        this.#propMeta = propMeta;
    }
}